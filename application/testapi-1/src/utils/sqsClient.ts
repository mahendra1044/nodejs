// Import AWS SDK for SQS
import { SQS } from 'aws-sdk';
// Import configuration for AWS settings
import { config } from '../config/config';
// Import Logger for SQS operations
import { Logger } from './logger';
// Import interfaces for type safety
import { SafeCreationRequest } from '../interfaces/cyberArkInterfaces';

/**
 * Client for interacting with AWS SQS
 * @class
 */
export class SQSClient {
  // SQS client instance
  private sqs: SQS;
  // URL of the SQS queue
  private queueUrl: string;
  // Logger for SQS operations
  private logger: Logger;

  /**
   * Initialize SQSClient with AWS region and queue URL
   */
  constructor() {
    // Create SQS client with configured region
    this.sqs = new SQS({ region: config.aws.region });
    // Set SQS queue URL from config
    this.queueUrl = config.aws.sqsQueueUrl;
    // Initialize logger for SQS operations
    this.logger = new Logger();
  }

  /**
   * Send a message to the SQS queue
   * @param message - Safe creation request to queue
   * @throws Error if sending fails
   */
  async sendMessage(message: SafeCreationRequest): Promise<void> {
    // Define SQS message parameters
    const params: SQS.SendMessageRequest = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(message),
      MessageGroupId: message.correlationId,
    };

    try {
      // Send message to SQS
      await this.sqs.sendMessage(params).promise();
      // Log successful message send
      this.logger.info(`Message sent to SQS: ${message.correlationId}`);
    } catch (error: any) {
      // Log error during message send
      this.logger.error(`Failed to send message to SQS: ${error.message}`);
      // Throw error
      throw new Error(`SQS send failed: ${error.message}`);
    }
  }
}