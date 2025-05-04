// Import axios for HTTP requests
import axios, { AxiosInstance } from 'axios';
// Import Logger for logging HTTP operations
import { Logger } from './logger';

/**
 * HTTP client for making API requests with logging and error handling
 * @class
 */
export class HttpClient {
  // Axios instance for HTTP requests
  private client: AxiosInstance;
  // Logger instance for logging HTTP operations
  private logger: Logger;

  /**
   * Initialize HttpClient with base URL and API key
   * @param baseUrl - Base URL for API requests
   * @param apiKey - API key for authorization
   */
  constructor(baseUrl: string, apiKey: string) {
    // Create Axios instance with base URL, headers, and timeout
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    // Initialize logger for HTTP operations
    this.logger = new Logger();
  }

  /**
   * Perform a GET request
   * @param url - Endpoint URL (relative to base URL)
   * @param params - Query parameters for the request
   * @returns Response data
   * @throws Error if request fails
   */
  async get<T>(url: string, params?: any): Promise<T> {
    try {
      // Execute GET request with provided URL and parameters
      const response = await this.client.get(url, { params });
      // Log successful request
      this.logger.info(`GET ${url} succeeded with status ${response.status}`);
      // Return response data
      return response.data;
    } catch (error: any) {
      // Log error with message
      this.logger.error(`GET ${url} failed: ${error.message}`);
      // Throw error with detailed message
      throw new Error(`GET request failed: ${error.message}`);
    }
  }

  /**
   * Perform a POST request
   * @param url - Endpoint URL (relative to base URL)
   * @param data - Request payload
   * @returns Response data
   * @throws Error if request fails
   */
  async post<T>(url: string, data: any): Promise<T> {
    try {
      // Execute POST request with provided URL and data
      const response = await this.client.post(url, data);
      // Log successful request
      this.logger.info(`POST ${url} succeeded with status ${response.status}`);
      // Return response data
      return response.data;
    } catch (error: any) {
      // Log error with message
      this.logger.error(`POST ${url} failed: ${error.message}`);
      // Throw error with detailed message
      throw new Error(`POST request failed: ${error.message}`);
    }
  }
}