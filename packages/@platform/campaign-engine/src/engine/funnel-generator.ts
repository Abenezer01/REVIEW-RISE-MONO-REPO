import { VerticalType } from '../config/vertical-profiles';
import { FUNNEL_DEFAULTS, FUNNEL_OVERRIDES } from '../constants';

export interface FunnelStageConfig {
    stage: 'Awareness' | 'Consideration' | 'Conversion';
    messageAngle: string;
    cta: string;
    audienceIntent: string;
    landingPageFocus: string;
}

export const generateAwarenessLayer = (vertical: VerticalType): FunnelStageConfig => {
    let messageAngle = FUNNEL_DEFAULTS.AWARENESS.MESSAGE;
    let cta = FUNNEL_DEFAULTS.AWARENESS.CTA;

    if (vertical === 'E-commerce') {
        const override = FUNNEL_OVERRIDES.ECOMMERCE.AWARENESS;
        messageAngle = override.MESSAGE;
        cta = override.CTA;
    } else if (vertical === 'SaaS') {
        const override = FUNNEL_OVERRIDES.SAAS.AWARENESS;
        messageAngle = override.MESSAGE;
    }

    return {
        stage: 'Awareness',
        messageAngle,
        cta,
        audienceIntent: FUNNEL_DEFAULTS.AWARENESS.INTENT,
        landingPageFocus: FUNNEL_DEFAULTS.AWARENESS.LANDING
    };
};

export const generateConsiderationLayer = (vertical: VerticalType): FunnelStageConfig => {
    let messageAngle = FUNNEL_DEFAULTS.CONSIDERATION.MESSAGE;
    let cta = FUNNEL_DEFAULTS.CONSIDERATION.CTA;

    if (vertical === 'E-commerce') {
        const override = FUNNEL_OVERRIDES.ECOMMERCE.CONSIDERATION;
        cta = override.CTA;
        messageAngle = override.MESSAGE;
    } else if (vertical === 'SaaS') {
        const override = FUNNEL_OVERRIDES.SAAS.CONSIDERATION;
        messageAngle = override.MESSAGE;
        cta = override.CTA;
    }

    return {
        stage: 'Consideration',
        messageAngle,
        cta,
        audienceIntent: FUNNEL_DEFAULTS.CONSIDERATION.INTENT,
        landingPageFocus: FUNNEL_DEFAULTS.CONSIDERATION.LANDING
    };
};

export const generateConversionLayer = (vertical: VerticalType): FunnelStageConfig => {
    let messageAngle = FUNNEL_DEFAULTS.CONVERSION.MESSAGE;
    let cta = FUNNEL_DEFAULTS.CONVERSION.CTA;

    if (vertical === 'E-commerce') {
        const override = FUNNEL_OVERRIDES.ECOMMERCE.CONVERSION;
        cta = override.CTA;
        messageAngle = override.MESSAGE;
    } else if (vertical === 'SaaS') {
        const override = FUNNEL_OVERRIDES.SAAS.CONVERSION;
        cta = override.CTA;
        messageAngle = override.MESSAGE;
    } else if (vertical === 'Healthcare') {
        const override = FUNNEL_OVERRIDES.HEALTHCARE.CONVERSION;
        cta = override.CTA;
        messageAngle = override.MESSAGE;
    }

    return {
        stage: 'Conversion',
        messageAngle,
        cta,
        audienceIntent: FUNNEL_DEFAULTS.CONVERSION.INTENT,
        landingPageFocus: FUNNEL_DEFAULTS.CONVERSION.LANDING
    };
};
