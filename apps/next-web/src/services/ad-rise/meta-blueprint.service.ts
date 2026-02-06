import type { MetaBlueprintInput, MetaBlueprintOutput } from '@platform/contracts';

import apiClient from '@/lib/apiClient';

export const MetaBlueprintService = {
    generate: async (data: MetaBlueprintInput) => {
        const baseURL = process.env.NEXT_PUBLIC_AD_RISE_API_URL || 'http://localhost:3005/api/v1';
        const response = await apiClient.post<MetaBlueprintOutput>('/blueprint/meta/generate', data, { baseURL });

        return response.data;
    },
};
