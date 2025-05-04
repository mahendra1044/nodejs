// Import dotenv for environment variable loading
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Configuration object for SaviyntWrapper application
 * @interface
 */
export const config = {
  saviynt: {
    // Saviynt API base URL, defaults to placeholder if not set
    baseUrl: process.env.SAVIYNT_API_URL || 'https://saviynt.api.com',
    // Saviynt API key, retrieved from Secrets Manager in production
    apiKey: process.env.SAVIYNT_API_KEY || 'your-saviynt-api-key',
  },
  server: {
    // Server port for Koa application
    port: parseInt(process.env.PORT || '3000', 10),
  },
  logging: {
    // Logging level (e.g., 'info', 'debug')
    level: process.env.LOG_LEVEL || 'info',
  },
  apigee: {
    // APIGEE API key for authentication
    apiKey: process.env.APIGEE_API_KEY || 'your-apigee-api-key',
  },
};