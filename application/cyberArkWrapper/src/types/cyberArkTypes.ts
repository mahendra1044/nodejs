/**
 * Response type for CyberArk safe creation
 * @interface
 */
export interface CyberArkSafeResponse {
    // Status of the safe creation request
    status: 'SUCCESS' | 'FAILED';
    // Unique identifier for the created safe, if successful
    safeId?: string;
    // Error or additional message, if applicable
    message?: string;
  }