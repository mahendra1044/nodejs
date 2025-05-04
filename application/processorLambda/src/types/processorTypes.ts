/**
 * Response type for Saviynt group creation
 * @interface
 */
export interface SaviyntGroupResponse {
    // Status of the group creation request
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    // Unique identifier for the group, if successful
    groupId?: string;
    // Error or additional message, if applicable
    message?: string;
  }
  
  /**
   * Response type for Saviynt group status check
   * @interface
   */
  export interface SaviyntGroupStatusResponse {
    // Indicates if the group exists
    exists: boolean;
    // Unique identifier for the group, if it exists
    groupId?: string;
    // Current status of the group
    status: 'CREATED' | 'PENDING' | 'FAILED';
  }
  
  /**
   * Response type for CyberArk safe creation
   * @interface
   */
  export interface CyberArkSafeResponse {
    // Status of the safe creation request
    status: 'SUCCESS' | 'FAILED';
    // Unique identifier for the safe, if successful
    safeId?: string;
    // Error or additional message, if applicable
    message?: string;
  }