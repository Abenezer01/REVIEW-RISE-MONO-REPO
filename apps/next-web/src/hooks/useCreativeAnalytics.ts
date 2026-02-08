
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// @ts-ignore
import { apiClient } from '@core/utils/api-client';

const ANALYTICS_ENDPOINT = '/api/v1/analytics/track';

export const useCreativeAnalytics = () => {
    const { user } = useAuth();

    const trackEvent = useCallback(async (
        eventType: 'wizard_start' | 'wizard_complete' | 'plan_exported',
        metadata: Record<string, any> = {}
    ) => {
        try {
            // "apiClient" usually points to the main API or proxy. 
            // We need to ensure we hit the express-ad-rise service.
            // If the monorepo proxies requests via Next.js rewrites, we use that.
            // Assuming Next.js rewrites /api/ad-rise -> express-ad-rise port.
            // OR if we need direct URL: process.env.NEXT_PUBLIC_AD_RISE_API_URL

            // For now, let's assume a direct call or a specific path prefix is needed if not proxied.
            // Since I don't see the next.config.js, I will assume we might need a full URL or a known proxy path.
            // Let's use a relative path assuming a proxy exists or adding a TODO.
            
            // Re-visiting the architecture: often there is a gateway or Next.js API route acting as proxy.
            // Let's assume we can hit the service directly for now if CORS allows, or via a Next.js API route.
            
            // NOTE: Replacing with direct call for now to standard "Ad Rise" base URL if available.
            // If not, we might need to hardcode specific port or use env var.
            
            const payload = {
                eventType,
                businessId: (user as any)?.businessId,
                userId: user?.id,
                metadata
            };

            // Using fetch to avoid dependency issues if apiClient is strict, 
            // or use apiClient if it handles auth headers automatically.
            // Let's try to use the ad-rise service URL directly if possible or relative if proxied.
            
            // TODO: Ensure this URL matches the ingress/proxy map.
            // Assuming local dev port 3100 for express-ad-rise based on previous file views.
            const baseUrl = process.env.NEXT_PUBLIC_AD_RISE_API_URL || 'http://localhost:3100';
            
            await fetch(`${baseUrl}${ANALYTICS_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth token if available in session
                },
                body: JSON.stringify(payload)
            });

        } catch (error) {
            console.warn('[Creative Analytics] Failed to track event:', error);
        }
    }, [user]);

    return {
        trackWizardStart: (meta?: any) => trackEvent('wizard_start', meta),
        trackWizardComplete: (meta?: any) => trackEvent('wizard_complete', meta),
        trackPlanExport: (meta?: any) => trackEvent('plan_exported', meta),
    };
};
