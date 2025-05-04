// Import HTTP client for API requests
import { HttpClient } from './httpClient';
// Import Logger for ServiceNow operations
import { Logger } from './logger';
// Import configuration for ServiceNow settings
import { config } from '../config/config';

/**
 * Client for interacting with ServiceNow API to create RITM tickets
 * @class
 */
export class ServiceNowClient {
  // HTTP client for ServiceNow API requests
  private httpClient: HttpClient;
  // Logger for ServiceNow operations
  private logger: Logger;

  /**
   * Initialize ServiceNowClient with HTTP client
   */
  constructor() {
    // Create HTTP client with ServiceNow base URL and API key
    this.httpClient = new HttpClient(config.serviceNow.baseUrl, config.serviceNow.apiKey);
    // Initialize logger
    this.logger = new Logger();
  }

  /**
   * Create a ServiceNow RITM ticket for a failure
   * @param correlationId - Unique identifier for the request
   * @param errorMessage - Error message for the failure
   * @returns RITM number
   * @throws Error if creation fails
   */
  async createRITM(correlationId: string, errorMessage: string): Promise<string> {
    // Log RITM creation attempt
    this.logger.info(`Creating RITM for correlationId: ${correlationId}`);
    try {
      // Send POST request to create RITM
      const response = await this.httpClient.post<{ ritmNumber: string }>('/createRITM', {
        correlationId,
        description: `Failed to create AD group: ${errorMessage}`,
      });
      // Log successful RITM creation
      this.logger.info(`RITM created: ${response.ritmNumber} for correlationId: ${correlationId}`);
      // Return RITM number
      return response.ritmNumber;
    } catch (error: any) {
      // Log error
      this.logger.error(`Failed to create RITM for correlationId ${correlationId}: ${error.message}`);
      // Throw error
      throw new Error(`ServiceNow RITM creation failed: ${error.message}`);
    }
  }
}