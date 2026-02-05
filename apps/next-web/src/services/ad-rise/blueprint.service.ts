import type { BlueprintInput, BlueprintOutput } from '@platform/contracts';

import apiClient from '@/lib/apiClient';

export const BlueprintService = {
    generate: async (data: BlueprintInput) => {
        const baseURL = process.env.NEXT_PUBLIC_AD_RISE_API_URL || 'http://localhost:3005/api/v1';
        const response = await apiClient.post<BlueprintOutput>('/blueprint/generate', data, { baseURL });

        return response.data;
    },
};
