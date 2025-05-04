// Import ProcessorService for processing SQS events
import { ProcessorService } from './services/processorService';
// Import Logger for Lambda logging
import { Logger } from './utils/logger';

/**
 * Lambda handler for processing SQS events
 * @param event - SQS event containing safe creation requests
 */
export const handler = async (event: AWSLambda.SQSEvent): Promise<void> => {
  // Initialize logger
  const logger = new Logger();
  // Log Lambda invocation
  logger.info('Lambda invoked with SQS event');

  try {
    // Create ProcessorService instance
    const processorService = new ProcessorService();
    // Process the SQS event
    await processorService.processEvent(event);
    // Log successful processing
    logger.info('Event processing completed');
  } catch (error: any) {
    // Log critical error
    logger.error(`Critical error in Lambda handler: ${error.message}`);
    // Rethrow error to trigger Lambda retry
    throw error;
  }
};