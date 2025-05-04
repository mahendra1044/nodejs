/**
 * Interface for safe creation request
 * @interface
 */
export interface SafeCreationRequest {
    // Unique identifier for the request
    correlationId: string;
    // Saviynt AD group attributes
    adGroupAttributes: SaviyntGroupAttributes;
    // CyberArk safe attributes
    pamSafeAttributes: CyberArkSafeAttributes;
  }
  
  /**
   * Interface for Saviynt AD group attributes
   * @interface
   */
  export interface SaviyntGroupAttributes {
    // Name of the AD group
    groupName: string;
    // Description of the AD group
    description: string;
    // Owner of the AD group
    owner: string;
  }
  
  /**
   * Interface for CyberArk safe attributes
   * @interface
   */
  export interface CyberArkSafeAttributes {
    // Name of the safe
    safeName: string;
    // Description of the safe
    description: string;
    // Managing CPM for the safe
    managingCPM: string;
  }