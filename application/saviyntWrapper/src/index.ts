// Import App for Koa server
import { App } from './app';

/**
 * Entry point for SaviyntWrapper application
 */
async function main(): Promise<void> {
  // Create App instance
  const app = new App();
  try {
    // Start the Koa server
    await app.start();
  } catch (error: any) {
    // Log fatal error and exit
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Execute main function
main();