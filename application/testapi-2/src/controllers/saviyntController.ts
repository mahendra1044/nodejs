// Import Koa Context for request/response handling
import { Context } from 'koa';
// Import SaviyntService for API operations
import { SaviyntService } from '../services/saviyntService';
// Import interfaces for type safety
import { SaviyntGroupAttributes } from '../interfaces/saviyntInterfaces';
// Import Logger for logging requests
import { Logger } from '../utils/logger';

/**
 * Controller for handling Saviynt API requests
 * @class
 */
export class SaviyntController {
  // SaviyntService instance for API operations
  private saviyntService: SaviyntService;
  // Logger for request logging
  private logger: Logger;

  /**
   * Initialize SaviyntController with service and logger
   */
  constructor() {
    // Create SaviyntService instance
    this.saviyntService = new SaviyntService();
    // Initialize logger for controller operations
    this.logger = new Logger();
  }

  /**
   * Handle POST request to create an AD group
   * @param ctx - Koa Context object
   */
  async createGroup(ctx: Context): Promise<void> {
    // Log receipt of createGroup request
    this.logger.info('Received createGroup request');
    try {
      // Extract group attributes from request body
      const attributes: SaviyntGroupAttributes = ctx.request.body as SaviyntGroupAttributes;
      // Validate required attributes
      if (!attributes.groupName || !attributes.description || !attributes.owner) {
        // Log validation failure
        this.logger.warn('Invalid group attributes');
        // Set 400 status and response body
        ctx.status = 400;
        ctx.body = { message: 'Invalid group attributes' };
        return;
      }
      // Call SaviyntService to create group
      const response = await this.saviyntService.createGroup(attributes);
      // Log service response
      this.logger.info(`Create group response: ${JSON.stringify(response)}`);
      // Set response status and body
      ctx.status = response.status === 'SUCCESS' ? 200 : 500;
      ctx.body = response;
    } catch (error: any) {
      // Log error during request processing
      this.logger.error(`Create group error: ${error.message}`);
      // Set 500 status and response body
      ctx.status = 500;
      ctx.body = { message: `Failed to create group: ${error.message}` };
    }
  }

  /**
   * Handle GET request to check AD group status
   * @param ctx - Koa Context object
   */
  async checkGroupStatus(ctx: Context): Promise<void> {
    // Log receipt of checkGroupStatus request
    this.logger.info('Received checkGroupStatus request');
    try {
      // Extract groupName from query parameters
      const groupName = ctx.query.groupName as string;
      // Validate groupName presence
      if (!groupName) {
        // Log missing parameter
        this.logger.warn('Missing groupName parameter');
        // Set 400 status and response body
        ctx.status = 400;
        ctx.body = { message: 'Missing groupName parameter' };
        return;
      }
      // Call SaviyntService to check group status
      const response = await this.saviyntService.checkGroupStatus(groupName);
      // Log service response
      this.logger.info(`Check group status response: ${JSON.stringify(response)}`);
      // Set response status and body
      ctx.status = response.exists ? 200 : 404;
      ctx.body = response;
    } catch (error: any) {
      // Log error during request processing
      this.logger.error(`Check group status error: ${error.message}`);
      // Set 500 status and response body
      ctx.status = 500;
      ctx.body = { message: `Failed to check group status: ${error.message}` };
    }
  }
}