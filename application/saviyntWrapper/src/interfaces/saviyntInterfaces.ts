/**
 * Interface for Saviynt AD group attributes
 * @interface
 */
export interface SaviyntGroupAttributes {
    // Name of the AD group to create
    groupName: string;
    // Description of the AD group
    description: string;
    // Owner of the AD group
    owner: string;
  }