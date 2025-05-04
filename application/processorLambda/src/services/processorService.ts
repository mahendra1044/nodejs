// Import AWS SDK for SQS
import { SQS } from 'aws-sdk';
// Import utility clients
import { HttpClient } from '../utils/httpClient';
import { SQSClient } from '../utils/sqsClient';
import { EmailClient } from '../utils/emailClient';
import { ServiceNowClient } from '../utils/serviceNowClient';
import { DynamoDBClient } from '../utils/dynamodbClient';
import { Logger } from '../utils/logger';
// Import configuration
import { config } from '../config/config';
// Import interfaces for type safety
import { SafeCreationRequest } from '../interfaces/processorInterfaces';
// Import types for API responses
import { SaviyntGroupResponse, SaviyntGroupStatusResponse, CyberArkSafeResponse } from '../types/processorTypes';

/**
 * Service for processing safe creation requests from SQS
 * @class
 */
export class ProcessorService {
  // HTTP client for SaviyntWrapper API
  private saviyntClient: HttpClient;
  // HTTP client for CyberArkWrapper API
  private cyberArkClient: HttpClient;
  // SQS client for queue operations
  private sqsClient: SQSClient;
  // Email client for notifications
  private emailClient: EmailClient;
  // ServiceNow client for escalations
  private serviceNowClient: ServiceNowClient;
  // DynamoDB client for retry tracking
  private dynamodbClient: DynamoDBClient;
  // Logger for processing operations
  private logger: Logger;

  /**
   * Initialize ProcessorService with clients
   */
  constructor() {
    // Initialize HTTP client for SaviyntWrapper
    this.saviyntClient = new HttpClient(config.saviynt.baseUrl, config.saviynt.apiKey);
    // Initialize HTTP client for CyberArkWrapper
    this.cyberArkClient = new HttpClient(config.cyberArk.baseUrl, config.cyberArk.apiKey);
    // Initialize SQS client
    this.sqsClient = new SQSClient();
    // Initialize Email client
    this.emailClient = new EmailClient();
    // Initialize ServiceNow client
    this.serviceNowClient = new ServiceNowClient();
    // Initialize DynamoDB client
    this.dynamodbClient = new DynamoDBClient();
    // Initialize logger
    this.logger = new Logger();
  }

  /**
   * Process an SQS event containing safe creation requests
   * @param event - SQS event with messages
   * @throws Error if processing fails critically
   */
  async processEvent(event: AWSLambda.SQSEvent): Promise<void> {
    // Log start of event processing
    this.logger.info(`Processing SQS event with ${event.Records.length} records`);

    // Process each SQS message
    for (const record of event.Records) {
      try {
        // Parse message body
        const request: SafeCreationRequest = JSON.parse(record.body);
        // Process the safe creation request
        await this.processRequest(request, record.receiptHandle);
      } catch (error: any) {
        // Log error for individual message
        this.logger.error(`Failed to process message ${record.messageId}: ${error.message}`);
        // Continue processing other messages
        continue;
      }
    }
  }

  /**
   * Process a single safe creation request
   * @param request - Safe creation request
   * @param receiptHandle - SQS receipt handle
   * @throws Error if processing fails
   */
  private async processRequest(request: SafeCreationRequest, receiptHandle: string): Promise<void> {
    // Log start of request processing
    this.logger.info(`Processing request with correlationId: ${request.correlationId}`);

    try {
      // Get current retry count
      const retryCount = await this.dynamodbClient.getRetryCount(request.correlationId);
      // Check if max retries exceeded
      if (retryCount >= config.maxRetries) {
        // Log max retries reached
        this.logger.warn(`Max retries reached for ${request.correlationId}`);
        // Escalate to ServiceNow
        const ritmNumber = await this.serviceNowClient.createRITM(
          request.correlationId,
          'Max retries exceeded for AD group creation'
        );
        // Send failure email
        await this.emailClient.sendEmail(
          `Safe Creation Failed: ${request.correlationId}`,
          `Failed to create safe after ${config.maxRetries} retries. RITM: ${ritmNumber}`
        );
        // Move to DLQ
        await this.sqsClient.sendToDLQ(request, 'Max retries exceeded');
        // Delete message from main queue
        await this.sqsClient.deleteMessage(receiptHandle);
        // Delete retry count
        await this.dynamodbClient.deleteRetryCount(request.correlationId);
        return;
      }

      // Check AD group status
      const groupStatus = await this.saviyntClient.get<SaviyntGroupStatusResponse>(
        '/saviynt/checkGroupStatus',
        { groupName: request.adGroupAttributes.groupName }
      );

      // If group doesn't exist or is pending, create it
      if (!groupStatus.exists || groupStatus.status === 'PENDING') {
        // Log group creation attempt
        this.logger.info(`Creating AD group: ${request.adGroupAttributes.groupName}`);
        const groupResponse = await this.saviyntClient.post<SaviyntGroupResponse>(
          '/saviynt/createGroup',
          request.adGroupAttributes
        );

        // Check group creation status
        if (groupResponse.status === 'FAILED') {
          // Log group creation failure
          this.logger.error(`Group creation failed: ${groupResponse.message}`);
          // Increment retry count
          await this.dynamodbClient.setRetryCount(request.correlationId, retryCount + 1);
          return; // Keep message in queue for retry
        }
      }

      // If group is created, proceed to safe creation
      if (groupStatus.status === 'CREATED' || groupStatus.exists) {
        // Log safe creation attempt
        this.logger.info(`Creating safe: ${request.pamSafeAttributes.safeName}`);
        const safeResponse = await this.cyberArkClient.post<CyberArkSafeResponse>(
          '/cyberark/createSafe',
          request.pamSafeAttributes
        );

        // Check safe creation status
        if (safeResponse.status === 'SUCCESS') {
          // Log successful safe creation
          this.logger.info(`Safe created successfully: ${request.pamSafeAttributes.safeName}`);
          // Send success email
          await this.emailClient.sendEmail(
            `Safe Creation Succeeded: ${request.correlationId}`,
            `AD Group ${request.adGroupAttributes.groupName} and Safe ${request.pamSafeAttributes.safeName} created.`
          );
          // Delete message from queue
          await this.sqsClient.deleteMessage(receiptHandle);
          // Delete retry count
          await this.dynamodbClient.deleteRetryCount(request.correlationId);
        } else {
          // Log safe creation failure
          this.logger.error(`Safe creation failed: ${safeResponse.message}`);
          // Increment retry count
          await this.dynamodbClient.setRetryCount(request.correlationId, retryCount + 1);
          // Escalate to ServiceNow if max retries reached
          if (retryCount + 1 >= config.maxRetries) {
            const ritmNumber = await this.serviceNowClient.createRITM(
              request.correlationId,
              `Safe creation failed: ${safeResponse.message}`
            );
            // Send failure email
            await this.emailClient.sendEmail(
              `Safe Creation Failed: ${request.correlationId}`,
              `Failed to create safe. RITM: ${ritmNumber}`
            );
            // Move to DLQ
            await this.sqsClient.sendToDLQ(request, safeResponse.message || 'Safe creation failed');
            // Delete message from main queue
            await this.sqsClient.deleteMessage(receiptHandle);
            // Delete retry count
            await this.dynamodbClient.deleteRetryCount(request.correlationId);
          }
        }
      } else {
        // Log pending group creation
        this.logger.info(`Group creation pending for ${request.correlationId}`);
        // Increment retry count
        await this.dynamodbClient.setRetryCount(request.correlationId, retryCount + 1);
      }
    } catch (error: any) {
      // Log processing error
      this.logger.error(`Error processing request ${request.correlationId}: ${error.message}`);
      // Increment retry count
      await this.dynamodbClient.setRetryCount(request.correlationId, retryCount + 1);
      // Check if max retries exceeded
      if (retryCount + 1 >= config.maxRetries) {
        // Escalate to ServiceNow
        const ritmNumber = await this.serviceNowClient.createRITM(request.correlationId, error.message);
        // Send failure email
        await this.emailClient.sendEmail(
          `Safe Creation Failed: ${request.correlationId}`,
          `Failed after ${config.maxRetries} retries. RITM: ${ritmNumber}`
        );
        // Move to DLQ
        await this.sqsClient.sendToDLQ(request, error.message);
        // Delete message from main queue
        await this.sqsClient.deleteMessage(receiptHandle);
        // Delete retry count
        await this.dynamodbClient.deleteRetryCount(request.correlationId);
      }
    }
  }
}