// Import Koa for web server
import Koa from 'koa';
// Import koa-body for parsing request bodies
import { koaBody } from 'koa-body';
// Import configuration for server settings
import { config } from './config/config';
// Import cyberArkRoutes for API endpoints
import { cyberArkRoutes } from './routes/cyberArkRoutes';
// Import Logger for logging server events
import { Logger } from './utils/logger';

/**
 * Main Koa application for CyberArkWrapper
 * @class
 */
export class App {
  // Koa application instance
  private app: Koa;
  // Logger for server events
  private logger: Logger;

  /**
   * Initialize Koa application
   */
  constructor() {
    // Create Koa application
    this.app = new Koa();
    // Initialize logger
    this.logger = new Logger();
    // Configure middleware and routes
    this.configure();
  }

  /**
   * Configure Koa middleware and routes
   */
  private configure(): void {
    // Add koa-body middleware to parse JSON request bodies
    this.app.use(koaBody());
    // Mount CyberArk routes
    this.app.use(cyberArkRoutes().routes()).use(cyberArkRoutes().allowedMethods());
    // Handle unknown routes
    this.app.use(async (ctx: Koa.Context) => {
      // Log unknown route access
      this.logger.warn(`Unknown route: ${ctx.method} ${ctx.path}`);
      // Set 404 status and response body
      ctx.status = 404;
      ctx.body = { message: 'Route not found' };
    });
  }

  /**
   * Start the Koa server
   */
  async start(): Promise<void> {
    try {
      // Start server on configured port
      this.app.listen(config.server.port, () => {
        // Log server startup
        this.logger.info(`Server started on port ${config.server.port}`);
      });
    } catch (error: any) {
      // Log server startup error
      this.logger.error(`Failed to start server: ${error.message}`);
      // Throw error to halt application
      throw error;
    }
  }
}