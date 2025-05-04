// Import HTTP client for API requests
import { HttpClient } from '../utils/httpClient';
// Import Logger for logging operations
import { Logger } from '../utils/logger';
// Import configuration for Saviynt settings
import { config } from '../config/config';
// Import interfaces for type safety
import { SaviyntGroupAttributes } from '../interfaces/saviyntInterfaces';
// Import types for response structures
import { SaviyntGroupResponse, SaviyntGroupStatusResponse } from '../types/saviyntTypes';

/**
 * Service for interacting with Saviynt REST API
 * @class
 */
export class SaviyntService {
  // HTTP client for Saviynt API requests
  private httpClient: HttpClient;
  // Logger for Saviynt operations
  private logger: Logger;

  /**
   * Initialize SaviyntService with HTTP client and logger
   */
  constructor() {
    // Create HTTP client with Saviynt base URL and API key
    this.httpClient = new HttpClient(config.saviynt.baseUrl, config.saviynt.apiKey);
    // Initialize logger for Saviynt operations
    this.logger = new Logger();
  }

  /**
   * Create an AD group in Saviynt
   * @param attributes - Group attributes (name, description, owner)
   * @returns SaviyntGroupResponse indicating creation status
   */
  async createGroup(attributes: SaviyntGroupAttributes): Promise<SaviyntGroupResponse> {
    // Log group creation attempt
    this.logger.info(`Creating group: ${attributes.groupName}`);
    try {
      // Send POST request to create group with attributes
      const response = await this.httpClient.post<SaviyntGroupResponse>('/createGroup', attributes);
      // Log successful group creation
      this.logger.info(`Group created: ${attributes.groupName}, Status: ${response.status}`);
      // Return API response
      return response;
    } catch (error: any) {
      // Log error during group creation
      this.logger.error(`Failed to create group ${attributes.groupName}: ${error.message}`);
      // Return failed response
      return { status: 'FAILED', message: error.message };
    }
  }

  /**
   * Check the status of an AD group in Saviynt
   * @param groupName - Name of the group to check
   * @returns SaviyntGroupStatusResponse indicating group status
   */
  async checkGroupStatus(groupName: string): Promise<SaviyntGroupStatusResponse> {
    // Log group status check attempt
    this.logger.info(`Checking group status: ${groupName}`);
    try {
      // Send GET request to check group status
      const response = await this.httpClient.get<SaviyntGroupStatusResponse>('/checkGroupStatus', { groupName });
      // Log successful status check
      this.logger.info(`Group status: ${groupName}, Exists: ${response.exists}, Status: ${response.status}`);
      // Return API response
      return response;
    } catch (error: any) {
      // Log error during status check
      this.logger.error(`Failed to check group status ${groupName}: ${error.message}`);
      // Return failed response
      return { exists: false, status: 'FAILED', message: error.message };
    }
  }
}