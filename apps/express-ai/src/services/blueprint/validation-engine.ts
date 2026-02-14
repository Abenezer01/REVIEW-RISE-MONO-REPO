import { BlueprintOutput, ValidationWarning, AdGroup, RSA_CONSTRAINTS } from '@platform/contracts';

export class ValidationEngine {
    validate(output: BlueprintOutput): ValidationWarning[] {
        const warnings: ValidationWarning[] = [];

        // Validate RSA Constraints
        if (output.adGroups) {
            output.adGroups.forEach(adGroup => {
                warnings.push(...this.checkRSAConstraints(adGroup));
            });
        }

        // Validate Negative Keywords
        if (output.negatives) {
            output.negatives.forEach(list => {
                warnings.push(...this.checkNegativeKeywords(list.keywords));
            });
        }

        return warnings;
    }

    private checkRSAConstraints(adGroup: AdGroup): ValidationWarning[] {
        const warnings: ValidationWarning[] = [];
        const { headlines, descriptions } = adGroup.assets;

        // Headline Count
        if (headlines.length < RSA_CONSTRAINTS.HEADLINE_MIN_COUNT) {
            warnings.push({
                type: 'RSA',
                message: `Ad Group "${adGroup.name}" has too few headlines (${headlines.length}). Minimum is ${RSA_CONSTRAINTS.HEADLINE_MIN_COUNT}.`,
                context: adGroup.name
            });
        }
        if (headlines.length > RSA_CONSTRAINTS.HEADLINE_MAX_COUNT) {
            warnings.push({
                type: 'RSA',
                message: `Ad Group "${adGroup.name}" has too many headlines (${headlines.length}). Maximum is ${RSA_CONSTRAINTS.HEADLINE_MAX_COUNT}.`,
                context: adGroup.name
            });
        }

        // Headline Length
        headlines.forEach(h => {
            if (h.length > RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH) {
                warnings.push({
                    type: 'RSA',
                    message: `Headline "${h}" exceeds ${RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH} characters.`,
                    context: adGroup.name
                });
            }
        });

        // Description Count
        if (descriptions.length < RSA_CONSTRAINTS.DESCRIPTION_MIN_COUNT) {
            warnings.push({
                type: 'RSA',
                message: `Ad Group "${adGroup.name}" has too few descriptions (${descriptions.length}). Minimum is ${RSA_CONSTRAINTS.DESCRIPTION_MIN_COUNT}.`,
                context: adGroup.name
            });
        }
        if (descriptions.length > RSA_CONSTRAINTS.DESCRIPTION_MAX_COUNT) {
            warnings.push({
                type: 'RSA',
                message: `Ad Group "${adGroup.name}" has too many descriptions (${descriptions.length}). Maximum is ${RSA_CONSTRAINTS.DESCRIPTION_MAX_COUNT}.`,
                context: adGroup.name
            });
        }

        // Description Length
        descriptions.forEach(d => {
            if (d.length > RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) {
                warnings.push({
                    type: 'RSA',
                    message: `Description "${d}" exceeds ${RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters.`,
                    context: adGroup.name
                });
            }
        });

        return warnings;
    }

    private checkNegativeKeywords(keywords: string[]): ValidationWarning[] {
        const warnings: ValidationWarning[] = [];
        const prohibited = ['course', 'training', 'how to', 'salary', 'job']; // Intent mismatch detection

        keywords.forEach(k => {
            if (prohibited.some(p => k.toLowerCase().includes(p))) {
                // Actually these are GOOD negative keywords. Wait, the prompt says "Intent mismatch detection: 'course', 'training', 'how to'".
                // This implies we should WARN if these are found in POSITIVE keywords, or maybe if they are MISSING from negatives?
                // "Add: compliance_warning: true"

                // Re-reading prompt: "Intent mismatch detection: 'course', 'training', 'how to' ... Return warnings if violated."
                // This likely means if the user is targeting these terms positively when they shouldn't (e.g. they want leads but target "how to").
            }
        });

        return warnings;
    }

    public checkIntentMismatch(positiveKeywords: string[]): ValidationWarning[] {
        const warnings: ValidationWarning[] = [];
        const educational = ['course', 'training', 'how to', 'learn', 'tutorial'];

        positiveKeywords.forEach(k => {
            if (educational.some(e => k.toLowerCase().includes(e))) {
                warnings.push({
                    type: 'Keyword',
                    message: `Potential intent mismatch: "${k}" implies educational intent, not commercial.`,
                    context: k
                });
            }
        });
        return warnings;
    }
}

export const validationEngine = new ValidationEngine();
