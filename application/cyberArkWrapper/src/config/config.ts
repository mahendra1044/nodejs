// Import dotenv for environment variable loading
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration object for CyberArkWrapper application
 * @interface
 */
export const config = {
  cyberArk: {
    // CyberArk API base URL
    baseUrl: process.env.CYBERARK_API_URL || 'https://cyberark.api.com',
    // CyberArk API key, from Secrets Manager
    apiKey: process.env.CYBERARK_API_KEY || 'your-cyberark-api-key',
  },
  aws: {
    // SQS queue URL for safe creation requests
    sqsQueueUrl: process.env.SQS_QUEUE_URL || 'your-sqs-queue-url',
    // AWS region for SQS
    region: process.env.AWS_REGION || 'us-east-1',
  },
  server: {
    // Server port for Koa application
    port: parseInt(process.env.PORT || '3000', 10),
  },
  logging: {
    // Logging level
    level: process.env.LOG_LEVEL || 'info',
  },
  apigee: {
    // APIGEE API key for authentication
    apiKey: process.env.APIGEE_API_KEY || 'your-apigee-api-key',
  },
};