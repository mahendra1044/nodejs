// Import dotenv for environment variable loading
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration object for ProcessorLambda
 * @interface
 */
export const config = {
  saviynt: {
    // SaviyntWrapper API base URL (via APIGEE)
    baseUrl: process.env.SAVIYNT_API_URL || 'https://api.apigee.com/saviynt',
    // Saviynt API key, from Secrets Manager
    apiKey: process.env.SAVIYNT_API_KEY || 'your-saviynt-api-key',
  },
  cyberArk: {
    // CyberArkWrapper API base URL (via APIGEE)
    baseUrl: process.env.CYBERARK_API_URL || 'https://api.apigee.com/cyberark',
    // CyberArk API key, from Secrets Manager
    apiKey: process.env.CYBERARK_API_KEY || 'your-cyberark-api-key',
  },
  serviceNow: {
    // ServiceNow API base URL
    baseUrl: process.env.SERVICENOW_API_URL || 'https://servicenow.api.com',
    // ServiceNow API key, from Secrets Manager
    apiKey: process.env.SERVICENOW_API_KEY || 'your-servicenow-api-key',
  },
  aws: {
    // SQS queue URL for processing
    sqsQueueUrl: process.env.SQS_QUEUE_URL || 'your-sqs-queue-url',
    // SQS DLQ URL for failed messages
    dlqUrl: process.env.SQS_DLQ_URL || 'your-sqs-dlq-url',
    // AWS region for services
    region: process.env.AWS_REGION || 'us-east-1',
    // DynamoDB table for retry tracking
    dynamodbTable: process.env.DYNAMODB_TABLE || 'RetryStore',
    // SES source email
    sesSource: process.env.SES_SOURCE || 'no-reply@example.com',
    // SES recipient email
    sesRecipient: process.env.SES_RECIPIENT || 'admin@example.com',
  },
  logging: {
    // Logging level
    level: process.env.LOG_LEVEL || 'info',
  },
  // Maximum retry attempts
  maxRetries: 6,
};