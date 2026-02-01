/**
 * System Message Codes used for uniform messaging across the monorepo.
 * One code = one meaning.
 */
export enum SystemMessageCode {
  // Generic
  SUCCESS = 'SUCCESS',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Auth
  AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS',
  AUTH_LOGIN_FAILED = 'AUTH_LOGIN_FAILED',
  AUTH_LOGOUT_SUCCESS = 'AUTH_LOGOUT_SUCCESS',
  AUTH_REGISTER_SUCCESS = 'AUTH_REGISTER_SUCCESS',
  AUTH_PASSWORD_RESET_SUCCESS = 'AUTH_PASSWORD_RESET_SUCCESS',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_USER_ALREADY_EXISTS = 'AUTH_USER_ALREADY_EXISTS',
  AUTH_EMAIL_NOT_VERIFIED = 'AUTH_EMAIL_NOT_VERIFIED',
  AUTH_EMAIL_VERIFIED = 'AUTH_EMAIL_VERIFIED',
  AUTH_EMAIL_ALREADY_VERIFIED = 'AUTH_EMAIL_ALREADY_VERIFIED',
  AUTH_VERIFICATION_EMAIL_SENT = 'AUTH_VERIFICATION_EMAIL_SENT',
  AUTH_PASSWORD_RESET_EMAIL_SENT = 'AUTH_PASSWORD_RESET_EMAIL_SENT',
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',

  // Operations
  ITEM_CREATED = 'ITEM_CREATED',
  ITEM_UPDATED = 'ITEM_UPDATED',
  ITEM_DELETED = 'ITEM_DELETED',
  SAVE_SUCCESS = 'SAVE_SUCCESS',
  SAVE_FAILED = 'SAVE_FAILED',
  DELETE_SUCCESS = 'DELETE_SUCCESS',
  DELETE_FAILED = 'DELETE_FAILED',

  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',

  // Brand & Content
  BRAND_PROFILE_NOT_FOUND = 'BRAND_PROFILE_NOT_FOUND',
  BRAND_PROFILE_UPDATED = 'BRAND_PROFILE_UPDATED',
  BRAND_PROFILE_DELETED = 'BRAND_PROFILE_DELETED',
  BRAND_TONE_GENERATED = 'BRAND_TONE_GENERATED',
  POST_NOT_FOUND = 'POST_NOT_FOUND',
  POST_CREATED = 'POST_CREATED',
  POST_UPDATED = 'POST_UPDATED',
  POST_DELETED = 'POST_DELETED',
  POST_DUPLICATED = 'POST_DUPLICATED',
  RECOMMENDATION_GENERATION_STARTED = 'RECOMMENDATION_GENERATION_STARTED',
  PLAN_GENERATION_STARTED = 'PLAN_GENERATION_STARTED',

  // AI
  AI_CAPTIONS_GENERATED = 'AI_CAPTIONS_GENERATED',
  AI_HASHTAGS_GENERATED = 'AI_HASHTAGS_GENERATED',
  AI_IDEAS_GENERATED = 'AI_IDEAS_GENERATED',
  AI_PLAN_GENERATED = 'AI_PLAN_GENERATED',
  AI_IMAGE_GENERATED = 'AI_IMAGE_GENERATED',
  AI_CAROUSEL_GENERATED = 'AI_CAROUSEL_GENERATED',
  AI_SCRIPT_GENERATED = 'AI_SCRIPT_GENERATED',

  // Reviews
  REVIEWS_SYNC_COMPLETED = 'REVIEWS_SYNC_COMPLETED',
  REVIEWS_SOURCE_CONNECTED = 'REVIEWS_SOURCE_CONNECTED',
  REVIEWS_SOURCE_DISCONNECTED = 'REVIEWS_SOURCE_DISCONNECTED',
  REVIEWS_REPLY_POSTED = 'REVIEWS_REPLY_POSTED',
  REVIEWS_REPLY_REJECTED = 'REVIEWS_REPLY_REJECTED',

  // SEO
  SEO_ANALYSIS_COMPLETED = 'SEO_ANALYSIS_COMPLETED',
  SEO_KEYWORD_CREATED = 'SEO_KEYWORD_CREATED',
  SEO_KEYWORD_UPDATED = 'SEO_KEYWORD_UPDATED',
  SEO_KEYWORD_DELETED = 'SEO_KEYWORD_DELETED',
  SEO_SUGGESTIONS_GENERATED = 'SEO_SUGGESTIONS_GENERATED',

  // Admin
  LOCATION_CREATED = 'LOCATION_CREATED',
  LOCATION_UPDATED = 'LOCATION_UPDATED',
  LOCATION_DELETED = 'LOCATION_DELETED',

  // Social
  SOCIAL_POST_PUBLISHED = 'SOCIAL_POST_PUBLISHED',
  SOCIAL_CONNECTION_CREATED = 'SOCIAL_CONNECTION_CREATED',
  SOCIAL_CONNECTION_DELETED = 'SOCIAL_CONNECTION_DELETED',
}

/**
 * System Message Severities
 */
export enum SystemMessageSeverity {
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

/**
 * Default severities for each message code
 */
export const DefaultSeverityMap: Record<SystemMessageCode, SystemMessageSeverity> = {
  [SystemMessageCode.SUCCESS]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.UNKNOWN_ERROR]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.INTERNAL_SERVER_ERROR]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.BAD_REQUEST]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.UNAUTHORIZED]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.FORBIDDEN]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.NOT_FOUND]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.CONFLICT]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.TOO_MANY_REQUESTS]: SystemMessageSeverity.WARNING,
  [SystemMessageCode.VALIDATION_ERROR]: SystemMessageSeverity.ERROR,

  [SystemMessageCode.AUTH_LOGIN_SUCCESS]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.AUTH_LOGIN_FAILED]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.AUTH_LOGOUT_SUCCESS]: SystemMessageSeverity.INFO,
  [SystemMessageCode.AUTH_REGISTER_SUCCESS]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.AUTH_PASSWORD_RESET_SUCCESS]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.AUTH_INVALID_CREDENTIALS]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.AUTH_SESSION_EXPIRED]: SystemMessageSeverity.WARNING,
  [SystemMessageCode.AUTH_USER_ALREADY_EXISTS]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.AUTH_EMAIL_NOT_VERIFIED]: SystemMessageSeverity.WARNING,
  [SystemMessageCode.AUTH_EMAIL_VERIFIED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.AUTH_EMAIL_ALREADY_VERIFIED]: SystemMessageSeverity.INFO,
  [SystemMessageCode.AUTH_VERIFICATION_EMAIL_SENT]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.AUTH_PASSWORD_RESET_EMAIL_SENT]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.AUTH_INVALID_TOKEN]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.AUTH_TOKEN_EXPIRED]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.AUTH_USER_NOT_FOUND]: SystemMessageSeverity.ERROR,

  [SystemMessageCode.ITEM_CREATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.ITEM_UPDATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.ITEM_DELETED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.SAVE_SUCCESS]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.SAVE_FAILED]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.DELETE_SUCCESS]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.DELETE_FAILED]: SystemMessageSeverity.ERROR,

  [SystemMessageCode.NETWORK_ERROR]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.GATEWAY_TIMEOUT]: SystemMessageSeverity.ERROR,

  [SystemMessageCode.BRAND_PROFILE_NOT_FOUND]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.BRAND_PROFILE_UPDATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.BRAND_PROFILE_DELETED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.BRAND_TONE_GENERATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.POST_NOT_FOUND]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.POST_CREATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.POST_UPDATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.POST_DELETED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.POST_DUPLICATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.RECOMMENDATION_GENERATION_STARTED]: SystemMessageSeverity.INFO,
  [SystemMessageCode.PLAN_GENERATION_STARTED]: SystemMessageSeverity.INFO,

  [SystemMessageCode.AI_CAPTIONS_GENERATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.AI_HASHTAGS_GENERATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.AI_IDEAS_GENERATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.AI_PLAN_GENERATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.AI_IMAGE_GENERATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.AI_CAROUSEL_GENERATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.AI_SCRIPT_GENERATED]: SystemMessageSeverity.SUCCESS,

  [SystemMessageCode.REVIEWS_SYNC_COMPLETED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.REVIEWS_SOURCE_CONNECTED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.REVIEWS_SOURCE_DISCONNECTED]: SystemMessageSeverity.INFO,
  [SystemMessageCode.REVIEWS_REPLY_POSTED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.REVIEWS_REPLY_REJECTED]: SystemMessageSeverity.INFO,

  [SystemMessageCode.SEO_ANALYSIS_COMPLETED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.SEO_KEYWORD_CREATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.SEO_KEYWORD_UPDATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.SEO_KEYWORD_DELETED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.SEO_SUGGESTIONS_GENERATED]: SystemMessageSeverity.SUCCESS,

  [SystemMessageCode.LOCATION_CREATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.LOCATION_UPDATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.LOCATION_DELETED]: SystemMessageSeverity.SUCCESS,

  [SystemMessageCode.SOCIAL_POST_PUBLISHED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.SOCIAL_CONNECTION_CREATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.SOCIAL_CONNECTION_DELETED]: SystemMessageSeverity.INFO,
};
