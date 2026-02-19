import type { MetaBlueprintInput, MetaBlueprintOutput } from '@platform/contracts';
import { SERVICES_CONFIG } from '@/configs/services';
import apiClient from '@/lib/apiClient';

export const MetaBlueprintService = {
    generate: async (data: MetaBlueprintInput) => {
        // Route through express-ai which combines deterministic engine + AI insights layer
        const baseURL = SERVICES_CONFIG.ai.url;
        const response = await apiClient.post<MetaBlueprintOutput>('/blueprint/meta/generate', data, { baseURL });

        return response.data;
    },
};
