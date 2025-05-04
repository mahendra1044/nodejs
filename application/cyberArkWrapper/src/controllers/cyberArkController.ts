// Import Koa Context for request/response handling
import { Context } from 'koa';
// Import CyberArkService for operations
import { CyberArkService } from '../services/cyberArkService';
// Import interfaces for type safety
import { SafeCreationRequest, CyberArkSafeAttributes } from '../interfaces/cyberArkInterfaces';
// Import Logger for request logging
import { Logger } from '../utils/logger';

/**
 * Controller for handling CyberArk API requests
 * @class
 */
export class CyberArkController {
  // CyberArkService instance for operations
  private cyberArkService: CyberArkService;
  // Logger for request logging
  private logger: Logger;

  /**
   * Initialize CyberArkController with service and logger
   */
  constructor() {
    // Create CyberArkService instance
    this.cyberArkService = new CyberArkService();
    // Initialize logger
    this.logger = new Logger();
  }

  /**
   * Handle POST request to initiate safe creation
   * @param ctx - Koa Context object
   */
  async initiateSafeCreation(ctx: Context): Promise<void> {
    // Log receipt of initiateSafeCreation request
    this.logger.info('Received initiateSafeCreation request');
    try {
      // Extract request payload
      const request: SafeCreationRequest = ctx.request.body as SafeCreationRequest;
      // Validate required fields
      if (!request.correlationId || !request.adGroupAttributes || !request.pamSafeAttributes) {
        // Log validation failure
        this.logger.warn('Invalid request payload');
        // Set 400 status and response body
        ctx.status = 400;
        ctx.body = { message: 'Invalid request payload' };
        return;
      }
      // Call CyberArkService to initiate safe creation
      const response = await this.cyberArkService.initiateSafeCreation(request);
      // Log service response
      this.logger.info(`Initiate safe creation response: ${JSON.stringify(response)}`);
      // Set response status and body
      ctx.status = response.status === 'SUCCESS' ? 200 : 500;
      ctx.body = response;
    } catch (error: any) {
      // Log error during request processing
      this.logger.error(`Initiate safe creation error: ${error.message}`);
      // Set 500 status and response body
      ctx.status = 500;
      ctx.body = { message: `Failed to initiate safe creation: ${error.message}` };
    }
  }

  /**
   * Handle POST request to create a safe
   * @param ctx - Koa Context object
   */
  async createSafe(ctx: Context): Promise<void> {
    // Log receipt of createSafe request
    this.logger.info('Received createSafe request');
    try {
      // Extract safe attributes from request body
      const attributes: CyberArkSafeAttributes = ctx.request.body as CyberArkSafeAttributes;
      // Validate required fields
      if (!attributes.safeName || !attributes.description || !attributes.managingCPM) {
        // Log validation failure
        this.logger.warn('Invalid safe attributes');
        // Set 400 status and response body
        ctx.status = 400;
        ctx.body = { message: 'Invalid safe attributes' };
        return;
      }
      // Call CyberArkService to create safe
      const response = await this.cyberArkService.createSafe(attributes);
      // Log service response
      this.logger.info(`Create safe response: ${JSON.stringify(response)}`);
      // Set response status and body
      ctx.status = response.status === 'SUCCESS' ? 200 : 500;
      ctx.body = response;
    } catch (error: any) {
      // Log error during request processing
      this.logger.error(`Create safe error: ${error.message}`);
      // Set 500 status and response body
      ctx.status = 500;
      ctx.body = { message: `Failed to create safe: ${error.message}` };
    }
  }
}