/**
 * Repository Index
 * 
 * Exports all repository instances for easy consumption.
 * Import repositories from this file to use in your application.
 * 
 * @example
 * import { userRepository, businessRepository } from '@platform/db';
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
export { SeoSnapshotRepository, seoSnapshotRepository } from './seo-snapshot.repository';
export { KeywordRepository, keywordRepository } from './keyword.repository';
export { KeywordRankRepository, keywordRankRepository } from './keyword-rank.repository';
export { VisibilityMetricRepository, visibilityMetricRepository } from './visibility-metric.repository';
export { JobRepository, jobRepository } from './job.repository';
export { ReviewSyncLogRepository, reviewSyncLogRepository } from './review-sync-log.repository';
export { BrandRecommendationRepository, brandRecommendationRepository } from './brand-recommendation.repository';
export { BrandScoreRepository, brandScoreRepository } from './brand-score.repository';
export { ReviewRepository, reviewRepository } from './review.repository';
export { BrandProfileRepository, brandProfileRepository } from './brand-profile.repository';
export { ReviewSourceRepository, reviewSourceRepository } from './review-source.repository';
export { BrandDNARepository, brandDNARepository } from './brand-dna.repository';
export { CompetitorRepository, competitorRepository } from './competitor.repository';
export { ReportRepository, reportRepository } from './report.repository';
export { CompetitorReviewRepository, competitorReviewRepository } from './competitor-review.repository';

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
import { seoSnapshotRepository } from './seo-snapshot.repository';
import { keywordRepository } from './keyword.repository';
import { keywordRankRepository } from './keyword-rank.repository';
import { visibilityMetricRepository } from './visibility-metric.repository';
import { jobRepository } from './job.repository';
import { reviewSyncLogRepository } from './review-sync-log.repository';
import { brandRecommendationRepository } from './brand-recommendation.repository';
import { brandScoreRepository } from './brand-score.repository';
import { reviewRepository } from './review.repository';
import { reviewSourceRepository } from './review-source.repository';
import { brandProfileRepository } from './brand-profile.repository';
import { brandDNARepository } from './brand-dna.repository';
import { competitorRepository } from './competitor.repository';
import { reportRepository } from './report.repository';
import { competitorReviewRepository } from './competitor-review.repository';

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
    seoSnapshot: seoSnapshotRepository,
    keyword: keywordRepository,
    keywordRank: keywordRankRepository,
    visibilityMetric: visibilityMetricRepository,
    job: jobRepository,
    reviewSyncLog: reviewSyncLogRepository,
    brandRecommendation: brandRecommendationRepository,
    brandScore: brandScoreRepository,
    review: reviewRepository,
    brandProfile: brandProfileRepository,
    brandDNA: brandDNARepository,
    competitor: competitorRepository,
    report: reportRepository,
    reviewSource: reviewSourceRepository,
    competitorReview: competitorReviewRepository,
} as const;
