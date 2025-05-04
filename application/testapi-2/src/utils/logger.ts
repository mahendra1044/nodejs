// Import winston for structured logging
import * as winston from 'winston';
// Import configuration for logging settings
import { config } from '../config/config';

/**
 * Logger utility for structured logging to console and CloudWatch
 * @class
 */
export class Logger {
  // Winston logger instance
  private logger: winston.Logger;

  /**
   * Initialize logger with configured log level and format
   */
  constructor() {
    // Create Winston logger with specified level and JSON format
    this.logger = winston.createLogger({
      level: config.logging.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
      ],
    });
  }

  /**
   * Log an info message
   * @param message - Message to log
   */
  info(message: string): void {
    // Log message at info level
    this.logger.info(message);
  }

  /**
   * Log an error message
   * @param message - Message to log
   */
  error(message: string): void {
    // Log message at error level
    this.logger.error(message);
  }

  /**
   * Log a warning message
   * @param message - Message to log
   */
  warn(message: string): void {
    // Log message at warn level
    this.logger.warn(message);
  }
}