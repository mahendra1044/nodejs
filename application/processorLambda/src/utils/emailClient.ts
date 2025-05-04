// Import AWS SDK for SES
import { SES } from 'aws-sdk';
// Import Logger for email operations
import { Logger } from './logger';
// Import configuration for AWS settings
import { config } from '../config/config';

/**
 * Client for sending emails via AWS SES
 * @class
 */
export class EmailClient {
  // SES client instance
  private ses: SES;
  // Logger for email operations
  private logger: Logger;

  /**
   * Initialize EmailClient with AWS region
   */
  constructor() {
    // Create SES client with configured region
    this.ses = new SES({ region: config.aws.region });
    // Initialize logger
    this.logger = new Logger();
  }

  /**
   * Send an email via SES
   * @param subject - Email subject
   * @param body - Email body text
   * @throws Error if sending fails
   */
  async sendEmail(subject: string, body: string): Promise<void> {
    // Define parameters for sending email
    const params: SES.SendEmailRequest = {
      Source: config.aws.sesSource,
      Destination: { ToAddresses: [config.aws.sesRecipient] },
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: body } },
      },
    };

    try {
      // Send email via SES
      await this.ses.sendEmail(params).promise();
      // Log successful email send
      this.logger.info(`Email sent: ${subject}`);
    } catch (error: any) {
      // Log error
      this.logger.error(`Failed to send email: ${error.message}`);
      // Throw error
      throw new Error(`Email send failed: ${error.message}`);
    }
  }
}