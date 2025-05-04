// Import AWS SDK for SQS
import { SQS } from 'aws-sdk';
// Import configuration for AWS settings
import { config } from '../config/config';
// Import Logger for SQS operations
import { Logger } from './logger';
// Import interfaces for type safety
import { SafeCreationRequest } from '../interfaces/processorInterfaces';

/**
 * Client for interacting with AWS SQS for receiving, deleting, and sending to DLQ
 * @class
 */
export class SQSClient {
  // SQS client instance
  private sqs: SQS;
  // URL of the main SQS queue
  private queueUrl: string;
  // URL of the DLQ
  private dlqUrl: string;
  // Logger for SQS operations
  private logger: Logger;

  /**
   * Initialize SQSClient with AWS region and queue URLs
   */
  constructor() {
    // Create SQS client with configured region
    this.sqs = new SQS({ region: config.aws.region });
    // Set main queue URL
    this.queueUrl = config.aws.sqsQueueUrl;
    // Set DLQ URL
    this.dlqUrl = config.aws.dlqUrl;
    // Initialize logger
    this.logger = new Logger();
  }

  /**
   * Receive messages from the SQS queue
   * @returns Array of SQS messages
   * @throws Error if receiving fails
   */
  async receiveMessages(): Promise<SQS.Message[]> {
    // Define parameters for receiving messages
    const params: SQS.ReceiveMessageRequest = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    };

    try {
      // Receive messages from SQS
      const result = await this.sqs.receiveMessage(params).promise();
      // Log number of messages received
      this.logger.info(`Received ${result.Messages?.length || 0} messages from SQS`);
      // Return messages or empty array
      return result.Messages || [];
    } catch (error: any) {
      // Log error
      this.logger.error(`Failed to receive messages: ${error.message}`);
      // Throw error
      throw new Error(`SQS receive failed: ${error.message}`);
    }
  }

  /**
   * Delete a message from the SQS queue
   * @param receiptHandle - Receipt handle of the message to delete
   * @throws Error if deletion fails
   */
  async deleteMessage(receiptHandle: string): Promise<void> {
    // Define parameters for deleting message
    const params: SQS.DeleteMessageRequest = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    };

    try {
      // Delete message from SQS
      await this.sqs.deleteMessage(params).promise();
      // Log successful deletion
      this.logger.info(`Deleted message with receiptHandle: ${receiptHandle}`);
    } catch (error: any) {
      // Log error
      this.logger.error(`Failed to delete message: ${error.message}`);
      // Throw error
      throw new Error(`SQS delete failed: ${error.message}`);
    }
  }

  /**
   * Send a message to the DLQ
   * @param message - Original safe creation request
   * @param errorMessage - Error message for failure
   * @throws Error if sending fails
   */
  async sendToDLQ(message: SafeCreationRequest, errorMessage: string): Promise<void> {
    // Create DLQ message with error details
    const dlqMessage = {
      ...message,
      errorMessage,
      failedAt: new Date().toISOString(),
    };

    // Define parameters for sending to DLQ
    const params: SQS.SendMessageRequest = {
      QueueUrl: this.dlqUrl,
      MessageBody: JSON.stringify(dlqMessage),
      MessageGroupId: message.correlationId,
    };

    try {
      // Send message to DLQ
      await this.sqs.sendMessage(params).promise();
      // Log successful DLQ send
      this.logger.info(`Sent message to DLQ: ${message.correlationId}`);
    } catch (error: any) {
      // Log error
      this.logger.error(`Failed to send message to DLQ: ${error.message}`);
      // Throw error
      throw new Error(`DLQ send failed: ${error.message}`);
    }
  }
}