// Import AWS SDK for DynamoDB
import { DynamoDB } from 'aws-sdk';
// Import configuration for AWS settings
import { config } from '../config/config';
// Import Logger for DynamoDB operations
import { Logger } from './logger';

/**
 * Client for interacting with DynamoDB to manage retry counts
 * @class
 */
export class DynamoDBClient {
  // DynamoDB DocumentClient instance
  private dynamodb: DynamoDB.DocumentClient;
  // Name of the DynamoDB table
  private tableName: string;
  // Logger for DynamoDB operations
  private logger: Logger;

  /**
   * Initialize DynamoDBClient with AWS region and table name
   */
  constructor() {
    // Create DocumentClient with configured region
    this.dynamodb = new DynamoDB.DocumentClient({ region: config.aws.region });
    // Set table name from configuration
    this.tableName = config.aws.dynamodbTable;
    // Initialize logger
    this.logger = new Logger();
  }

  /**
   * Get the retry count for a correlationId
   * @param correlationId - Unique identifier for the request
   * @returns Current retry count
   * @throws Error if retrieval fails
   */
  async getRetryCount(correlationId: string): Promise<number> {
    // Define parameters for getting item
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: this.tableName,
      Key: { correlationId },
    };

    try {
      // Retrieve item from DynamoDB
      const result = await this.dynamodb.get(params).promise();
      // Extract retry count, default to 0 if not found
      const count = result.Item?.retryCount || 0;
      // Log retrieved retry count
      this.logger.info(`Retrieved retry count for ${correlationId}: ${count}`);
      // Return retry count
      return count;
    } catch (error: any) {
      // Log error during retrieval
      this.logger.error(`Failed to get retry count for ${correlationId}: ${error.message}`);
      // Throw error with detailed message
      throw new Error(`DynamoDB get failed: ${error.message}`);
    }
  }

  /**
   * Set the retry count for a correlationId
   * @param correlationId - Unique identifier for the request
   * @param retryCount - New retry count
   * @throws Error if update fails
   */
  async setRetryCount(correlationId: string, retryCount: number): Promise<void> {
    // Define parameters for putting item with TTL
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: {
        correlationId,
        retryCount,
        ttl: Math.floor(Date.now() / 1000) + 86400, // 1-day TTL
      },
    };

    try {
      // Update item in DynamoDB
      await this.dynamodb.put(params).promise();
      // Log successful update
      this.logger.info(`Set retry count for ${correlationId}: ${retryCount}`);
    } catch (error: any) {
      // Log error during update
      this.logger.error(`Failed to set retry count for ${correlationId}: ${error.message}`);
      // Throw error with detailed message
      throw new Error(`DynamoDB put failed: ${error.message}`);
    }
  }

  /**
   * Delete the retry count for a correlationId
   * @param correlationId - Unique identifier for the request
   * @throws Error if deletion fails
   */
  async deleteRetryCount(correlationId: string): Promise<void> {
    // Define parameters for deleting item
    const params: DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: this.tableName,
      Key: { correlationId },
    };

    try {
      // Delete item from DynamoDB
      await this.dynamodb.delete(params).promise();
      // Log successful deletion
      this.logger.info(`Deleted retry count for ${correlationId}`);
    } catch (error: any) {
      // Log error during deletion
      this.logger.error(`Failed to delete retry count for ${correlationId}: ${error.message}`);
      // Throw error with detailed message
      throw new Error(`DynamoDB delete failed: ${error.message}`);
    }
  }
}