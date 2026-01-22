/**
 * External API Configuration
 * Centralized configuration for third-party API endpoints
 */

/**
 * Facebook Graph API Configuration
 * @see https://developers.facebook.com/docs/graph-api
 */
export const FACEBOOK_API = {
  /** Base URL for Facebook OAuth dialogs */
  BASE_URL: 'https://www.facebook.com',
  
  /** Base URL for Facebook Graph API calls */
  GRAPH_URL: 'https://graph.facebook.com',
  
  /** API version to use for all Graph API calls */
  API_VERSION: 'v18.0',
  
  /** Full OAuth dialog URL */
  get OAUTH_DIALOG_URL() {
    return `${this.BASE_URL}/${this.API_VERSION}/dialog/oauth`;
  },
  
  /** Full Graph API base URL with version */
  get GRAPH_API_URL() {
    return `${this.GRAPH_URL}/${this.API_VERSION}`;
  }
} as const;

/**
 * LinkedIn API Configuration
 * @see https://docs.microsoft.com/en-us/linkedin/
 */
export const LINKEDIN_API = {
  /** Base URL for LinkedIn OAuth endpoints */
  AUTH_BASE_URL: 'https://www.linkedin.com/oauth/v2',
  
  /** Base URL for LinkedIn REST API */
  API_BASE_URL: 'https://api.linkedin.com/v2',
  
  /** Full authorization URL */
  get AUTHORIZATION_URL() {
    return `${this.AUTH_BASE_URL}/authorization`;
  },
  
  /** Full access token URL */
  get ACCESS_TOKEN_URL() {
    return `${this.AUTH_BASE_URL}/accessToken`;
  }
} as const;
