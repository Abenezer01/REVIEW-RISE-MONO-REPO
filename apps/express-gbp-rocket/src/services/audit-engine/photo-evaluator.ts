import { AuditIssue, EvaluatorResult, PhotoQualityDetails } from './types';

export interface PhotoEvaluatorResult extends EvaluatorResult {
    basicScore: number;
    improvementPlan: string[];
    details: PhotoQualityDetails;
}

export class PhotoEvaluator {
    evaluate(rawProfile: any): PhotoEvaluatorResult {
        const issues: AuditIssue[] = [];
        const improvementPlan: string[] = [];
        let score = 100;
        let basicScore = 100; // For 'media' breakdown

        const mediaItems = Array.isArray(rawProfile.media) ? rawProfile.media : [];
        const photoCount = mediaItems.length;

        // B. Required Types
        const hasCover = mediaItems.some((m: any) => m.locationAssociation?.category === 'COVER');
        const hasLogo = mediaItems.some((m: any) => m.locationAssociation?.category === 'LOGO');

        // C. Recency
        const d30 = new Date(); d30.setDate(d30.getDate() - 30);
        const d90 = new Date(); d90.setDate(d90.getDate() - 90);
        const d180 = new Date(); d180.setDate(d180.getDate() - 180);

        const last30Days = mediaItems.filter((m: any) => {
            const date = m.createTime ? new Date(m.createTime) : null;
            return date && date > d30;
        });

        const recentPhotos = mediaItems.filter((m: any) => {
            const date = m.createTime ? new Date(m.createTime) : null;
            return date && date > d90;
        });

        const sixMonthPhotos = mediaItems.filter((m: any) => {
            const date = m.createTime ? new Date(m.createTime) : null;
            return date && date > d180;
        });

        const details: PhotoQualityDetails = {
            totalPhotos: photoCount,
            hasCoverPhoto: hasCover,
            hasLogo: hasLogo,
            recency: {
                last30Days: last30Days.length,
                last30To90Days: recentPhotos.length - last30Days.length,
                older: photoCount - recentPhotos.length
            }
        };

        // A. Photo Count
        if (photoCount < 5) {
            score -= 40;
            basicScore -= 50;
            issues.push({
                code: 'photo_count_critical',
                severity: 'critical',
                title: 'Very Few Photos',
                whyItMatters: 'Profiles with fewer than 5 photos receive significantly fewer clicks.',
                recommendation: 'Upload at least 5 high-quality photos.',
                nextAction: 'Upload 10 more photos to reach the recommended minimum.',
                impactWeight: 9
            });
            improvementPlan.push('Upload 10 more photos to reach the recommended minimum.');
        } else if (photoCount < 15) {
            score -= 20;
            basicScore -= 20;
            issues.push({
                code: 'photo_count_warning',
                severity: 'warning',
                title: 'Photo Count Low',
                whyItMatters: 'Having 15+ photos signals an active business to Google.',
                recommendation: 'Aim for at least 15 photos.',
                nextAction: `Upload ${15 - photoCount} more photos.`,
                impactWeight: 5
            });
            improvementPlan.push(`Upload ${15 - photoCount} more photos.`);
        } else {
            improvementPlan.push('Maintain photo volume by adding 1 new photo weekly.');
        }

        if (!hasCover) {
            score -= 20;
            issues.push({
                code: 'photo_missing_cover',
                severity: 'critical',
                title: 'Missing Cover Photo',
                whyItMatters: 'Your cover photo is the first impression customers see.',
                recommendation: 'Upload a dedicated Cover Photo.',
                nextAction: 'Add a new cover photo.',
                impactWeight: 8
            });
            improvementPlan.push('Add a new cover photo.');
        }

        if (!hasLogo) {
            score -= 10;
            issues.push({
                code: 'photo_missing_logo',
                severity: 'warning',
                title: 'Missing Logo',
                whyItMatters: 'A logo builds brand recognition and trust.',
                recommendation: 'Upload your business logo.',
                nextAction: 'Upload your business logo.',
                impactWeight: 6
            });
            improvementPlan.push('Upload your business logo.');
        }

        if (photoCount > 0) {
            if (sixMonthPhotos.length === 0) {
                score -= 30;
                issues.push({
                    code: 'photo_freshness_critical',
                    severity: 'critical',
                    title: 'Photos are Outdated',
                    whyItMatters: 'No new photos in 6 months indicates an inactive business.',
                    recommendation: 'Upload recent photos immediately.',
                    nextAction: 'Upload recent photos from the last 30 days.',
                    impactWeight: 8
                });
                improvementPlan.push('Upload recent photos from the last 30 days.');
            } else if (recentPhotos.length === 0) {
                score -= 15;
                issues.push({
                    code: 'photo_freshness_warning',
                    severity: 'warning',
                    title: 'No Recent Photos',
                    whyItMatters: 'Fresh content improves ranking and user engagement.',
                    recommendation: 'Upload photos from the last 90 days.',
                    nextAction: 'Upload recent photos from the last 90 days.',
                    impactWeight: 5
                });
                improvementPlan.push('Upload recent photos from the last 90 days.');
            }
        }

        // D. Resolution
        const lowResPhotos = mediaItems.filter((m: any) => {
            const width = m.dimensions?.widthPixels;
            return width && width < 720;
        });

        if (lowResPhotos.length > 0) {
            score -= 10;
            issues.push({
                code: 'photo_resolution_warning',
                severity: 'warning',
                title: 'Low Resolution Photos',
                whyItMatters: 'Low resolution photos look unprofessional on modern screens.',
                recommendation: 'Replace low-resolution photos with HD images (min 720px width).',
                nextAction: `Replace ${lowResPhotos.length} low-resolution photos.`,
                impactWeight: 4
            });
            improvementPlan.push(`Replace ${lowResPhotos.length} low-resolution photos.`);
        }

        return {
            basicScore: Math.max(0, basicScore),
            score: Math.max(0, score),
            issues,
            improvementPlan,
            details
        };
    }
}

export const photoEvaluator = new PhotoEvaluator();
