/**
 * Platform-specific advertising constraints and validation rules
 */

/**
 * Google Ads Responsive Search Ads (RSA) constraints
 * @see https://support.google.com/google-ads/answer/7684791
 */
export const RSA_CONSTRAINTS = {
    /** Maximum character length for RSA headlines */
    HEADLINE_MAX_LENGTH: 30,
    /** Minimum number of headlines required */
    HEADLINE_MIN_COUNT: 3,
    /** Maximum number of headlines allowed */
    HEADLINE_MAX_COUNT: 15,
    /** Maximum character length for RSA descriptions */
    DESCRIPTION_MAX_LENGTH: 90,
    /** Minimum number of descriptions required */
    DESCRIPTION_MIN_COUNT: 2,
    /** Maximum number of descriptions allowed */
    DESCRIPTION_MAX_COUNT: 4,
} as const;

/**
 * Meta Ads (Facebook/Instagram) character constraints
 * @see https://www.facebook.com/business/help/980593475366490
 */
export const META_CONSTRAINTS = {
    /** Maximum character length for primary text (body copy) */
    PRIMARY_TEXT_MAX_LENGTH: 125,
    /** Recommended character length for primary text to avoid truncation */
    PRIMARY_TEXT_RECOMMENDED_LENGTH: 125,
    /** Maximum character length for headlines */
    HEADLINE_MAX_LENGTH: 40,
    /** Recommended character length for headlines */
    HEADLINE_RECOMMENDED_LENGTH: 40,
    /** Maximum character length for descriptions (link description) */
    DESCRIPTION_MAX_LENGTH: 30,
    /** Recommended character length for descriptions */
    DESCRIPTION_RECOMMENDED_LENGTH: 25,
} as const;

/**
 * Validation helper: Check if text exceeds maximum length
 */
export function isWithinLimit(text: string, maxLength: number): boolean {
    return text.length <= maxLength;
}

/**
 * Validation helper: Get character count status
 */
export function getCharacterStatus(text: string, maxLength: number, recommendedLength?: number) {
    const length = text.length;
    const remaining = maxLength - length;
    const isValid = length <= maxLength;
    const isRecommended = recommendedLength ? length <= recommendedLength : isValid;

    return {
        length,
        maxLength,
        recommendedLength,
        remaining,
        isValid,
        isRecommended,
        percentUsed: Math.round((length / maxLength) * 100),
    };
}

/**
 * Validation helper: Validate RSA headline
 */
export function validateRSAHeadline(headline: string) {
    return getCharacterStatus(headline, RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH);
}

/**
 * Validation helper: Validate RSA description
 */
export function validateRSADescription(description: string) {
    return getCharacterStatus(description, RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH);
}

/**
 * Validation helper: Validate Meta primary text
 */
export function validateMetaPrimaryText(text: string) {
    return getCharacterStatus(
        text,
        META_CONSTRAINTS.PRIMARY_TEXT_MAX_LENGTH,
        META_CONSTRAINTS.PRIMARY_TEXT_RECOMMENDED_LENGTH
    );
}

/**
 * Validation helper: Validate Meta headline
 */
export function validateMetaHeadline(headline: string) {
    return getCharacterStatus(
        headline,
        META_CONSTRAINTS.HEADLINE_MAX_LENGTH,
        META_CONSTRAINTS.HEADLINE_RECOMMENDED_LENGTH
    );
}

/**
 * Validation helper: Validate Meta description
 */
export function validateMetaDescription(description: string) {
    return getCharacterStatus(
        description,
        META_CONSTRAINTS.DESCRIPTION_MAX_LENGTH,
        META_CONSTRAINTS.DESCRIPTION_RECOMMENDED_LENGTH
    );
}
