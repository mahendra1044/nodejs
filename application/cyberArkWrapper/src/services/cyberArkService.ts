// Import HTTP client for API requests
import { HttpClient } from '../utils/httpClient';
// Import SQS client for queuing requests
import { SQSClient } from '../utils/sqsClient';
// Import Logger for logging operations
import { Logger } from '../utils/logger';
// Import configuration for settings
import { config } from '../config/config';
// Import interfaces for type safety
import { SafeCreationRequest, CyberArkSafeAttributes } from '../interfaces/cyberArkInterfaces';
// Import types for response structures
import { CyberArkSafeResponse } from '../types/cyberArkTypes';

/**
 * Service for initiating CyberArk safe creation and direct safe creation
 * @class
 */
export class CyberArkService {
  // HTTP client for CyberArk API requests
  private httpClient: HttpClient;
  // SQS client for queuing requests
  private sqsClient: SQSClient;
  // Logger for CyberArk operations
  private logger: Logger;

  /**
   * Initialize CyberArkService with HTTP and SQS clients
   */
  constructor() {
    // Create HTTP client with CyberArk base URL and API key
    this.httpClient = new HttpClient(config.cyberArk.baseUrl, config.cyberArk.apiKey);
    // Create SQS client for queuing
    this.sqsClient = new SQSClient();
    // Initialize logger
    this.logger = new Logger();
  }

  /**
   * Initiate safe creation by queuing request in SQS
   * @param request - Safe creation request with group and safe attributes
   * @returns Status and message indicating queuing success or failure
   */
  async initiateSafeCreation(request: SafeCreationRequest): Promise<{ status: string; message: string }> {
    // Log initiation of safe creation
    this.logger.info(`Initiating safe creation: ${request.correlationId}`);
    try {
      // Send request to SQS queue
      await this.sqsClient.sendMessage(request);
      // Log successful queuing
      this.logger.info(`Safe creation request queued: ${request.correlationId}`);
      // Return success response
      return {
        status: 'SUCCESS',
        message: 'Received your Safe creation request. Processing will complete shortly.',
      };
    } catch (error: any) {
      // Log error during queuing
      this.logger.error(`Failed to initiate safe creation: ${error.message}`);
      // Return failed response
      return { status: 'FAILED', message: error.message };
    }
  }

  /**
   * Create a safe in CyberArk
   * @param attributes - Safe attributes (name, description, managingCPM)
   * @returns CyberArkSafeResponse indicating creation status
   */
  async createSafe(attributes: CyberArkSafeAttributes): Promise<CyberArkSafeResponse> {
    // Log safe creation attempt
    this.logger.info(`Creating safe: ${attributes.safeName}`);
    try {
      // Send POST request to create safe
      const response = await this.httpClient.post<CyberArkSafeResponse>('/createSafe', attributes);
      // Log successful safe creation
      this.logger.info(`Safe created: ${attributes.safeName}, Status: ${response.status}`);
      // Return API response
      return response;
    } catch (error: any) {
      // Log error during safe creation
      this.logger.error(`Failed to create safe ${attributes.safeName}: ${error.message}`);
      // Return failed response
      return { status: 'FAILED', message: error.message };
    }
  }
}