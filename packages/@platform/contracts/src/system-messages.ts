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

  [SystemMessageCode.ITEM_CREATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.ITEM_UPDATED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.ITEM_DELETED]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.SAVE_SUCCESS]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.SAVE_FAILED]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.DELETE_SUCCESS]: SystemMessageSeverity.SUCCESS,
  [SystemMessageCode.DELETE_FAILED]: SystemMessageSeverity.ERROR,

  [SystemMessageCode.NETWORK_ERROR]: SystemMessageSeverity.ERROR,
  [SystemMessageCode.GATEWAY_TIMEOUT]: SystemMessageSeverity.ERROR,
};
