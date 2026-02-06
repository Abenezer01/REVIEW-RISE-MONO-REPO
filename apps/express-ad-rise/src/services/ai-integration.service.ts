import { BlueprintInput, BlueprintOutput, MetaBlueprintInput, MetaBlueprintOutput } from '@platform/contracts';

import { apiClient } from '@platform/utils/apiClient';

import { getRequestContext } from '@platform/utils/apiClient';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3002';

export class AiIntegrationService {
    async generateBlueprint(input: BlueprintInput): Promise<BlueprintOutput> {
        try {
            const token = getRequestContext('authToken');
            console.log('[AiIntegrationService] Token from context:', token ? (token.substring(0, 20) + '...') : 'undefined');

            // apiClient automatically attaches Authorization header from request context
            const response = await apiClient.post<any>(`${AI_SERVICE_URL}/api/v1/blueprint/generate`, input);
            return response.data.data; // Assuming standardized response structure
        } catch (error) {
            console.error('Error calling AI service:', error);
            throw error;
        }
    }

    async generateMetaBlueprint(input: MetaBlueprintInput): Promise<MetaBlueprintOutput> {
        try {
            const response = await apiClient.post<any>(`${AI_SERVICE_URL}/api/v1/blueprint/meta/generate`, input);
            return response.data.data;
        } catch (error) {
            console.error('Error calling AI service for Meta Blueprint:', error);
            throw error;
        }
    }
}

export const aiIntegrationService = new AiIntegrationService();

