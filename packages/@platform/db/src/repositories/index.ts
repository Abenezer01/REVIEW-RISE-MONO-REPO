/**
 * Repository Index
 * 
 * Exports all repository instances for easy consumption.
 * Import repositories from this file to use in your application.
 * 
 * @example
 * import { userRepository, businessRepository } from '@platform/db/repositories';
 * 
 * const user = await userRepository.findByEmail('user@example.com');
 * const businesses = await businessRepository.findByUserId(user.id);
 */

export { BaseRepository } from './base.repository';

export { UserRepository, userRepository } from './user.repository';
export { BusinessRepository, businessRepository } from './business.repository';
export { LocationRepository, locationRepository } from './location.repository';
export { RoleRepository, roleRepository } from './role.repository';
export { PermissionRepository, permissionRepository } from './permission.repository';
export { SubscriptionRepository, subscriptionRepository } from './subscription.repository';
export { SessionRepository, sessionRepository } from './session.repository';
export { PasswordResetTokenRepository, passwordResetTokenRepository } from './password-reset-token.repository';
export { EmailVerificationTokenRepository, emailVerificationTokenRepository } from './email-verification-token.repository';
export { AuditLogRepository, auditLogRepository } from './audit-log.repository';

// Import repositories for the convenience object
import { userRepository } from './user.repository';
import { businessRepository } from './business.repository';
import { locationRepository } from './location.repository';
import { roleRepository } from './role.repository';
import { permissionRepository } from './permission.repository';
import { subscriptionRepository } from './subscription.repository';
import { sessionRepository } from './session.repository';
import { passwordResetTokenRepository } from './password-reset-token.repository';
import { emailVerificationTokenRepository } from './email-verification-token.repository';
import { auditLogRepository } from './audit-log.repository';

// Re-export all repositories as a single object for convenience
export const repositories = {
    user: userRepository,
    business: businessRepository,
    location: locationRepository,
    role: roleRepository,
    permission: permissionRepository,
    subscription: subscriptionRepository,
    session: sessionRepository,
    passwordResetToken: passwordResetTokenRepository,
    emailVerificationToken: emailVerificationTokenRepository,
    auditLog: auditLogRepository,
} as const;

