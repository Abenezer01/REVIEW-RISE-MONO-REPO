import { RSA_CONSTRAINTS, META_CONSTRAINTS } from '@platform/contracts';

/**
 * Validation logic for RSA headlines and descriptions
 */
export const useRSAValidation = () => {
    /**
     * Validate RSA Headline
     * @param text headline text
     * @returns validation result
     */
    const validateHeadline = (text: string) => {
        const length = text.length;
        const remaining = RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH - length;
        const isValid = length <= RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH;

        return {
            isValid,
            length,
            maxLength: RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH,
            remaining,
            message: isValid ? null : `Maximum ${RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH} characters`
        };
    };

    /**
     * Validate RSA Description
     * @param text description text
     * @returns validation result
     */
    const validateDescription = (text: string) => {
        const length = text.length;
        const remaining = RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH - length;
        const isValid = length <= RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH;

        return {
            isValid,
            length,
            maxLength: RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH,
            remaining,
            message: isValid ? null : `Maximum ${RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`
        };
    };

    /**
     * Validate Meta Primary Text
     * @param text primary text
     */
    const validateMetaPrimaryText = (text: string) => {
        const length = text.length;
        const remaining = META_CONSTRAINTS.PRIMARY_TEXT_MAX_LENGTH - length;
        const isValid = length <= META_CONSTRAINTS.PRIMARY_TEXT_MAX_LENGTH;
        const isRecommended = length <= META_CONSTRAINTS.PRIMARY_TEXT_RECOMMENDED_LENGTH;

        return {
            isValid,
            isRecommended,
            length,
            maxLength: META_CONSTRAINTS.PRIMARY_TEXT_MAX_LENGTH,
            recommendedLength: META_CONSTRAINTS.PRIMARY_TEXT_RECOMMENDED_LENGTH,
            remaining,
            message: isValid
                ? (isRecommended ? null : `Recommended ${META_CONSTRAINTS.PRIMARY_TEXT_RECOMMENDED_LENGTH} chars`)
                : `Maximum ${META_CONSTRAINTS.PRIMARY_TEXT_MAX_LENGTH} characters`
        };
    };

    return {
        validateHeadline,
        validateDescription,
        validateMetaPrimaryText,
        constraints: {
            rsa: RSA_CONSTRAINTS,
            meta: META_CONSTRAINTS
        }
    };
};
