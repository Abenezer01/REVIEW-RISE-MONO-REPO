/* eslint-disable import/no-unresolved */
import { backendClient } from '@/utils/backendClient';

interface BrandProfile {
  id: string;
  websiteUrl: string;
  status: 'pending' | 'extracting' | 'completed' | 'failed' | 'pending_confirmation';
  currentExtractedData: any;
  extractedDataVersions: { data: any; extractedAt: Date; versionId: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export const BrandProfileService = {
  onboardBrandProfile: async (businessId: string, websiteUrl: string): Promise<{ message: string; brandProfileId: string }> => {
    const response = await backendClient('/api/brands/onboard', {
      method: 'POST',
      data: { businessId, websiteUrl },
    });

    return response;
  },

  getBrandProfile: async (id: string): Promise<BrandProfile> => {
    const response = await backendClient(`/api/brands/${id}`, {
      method: 'GET',
    });

    return response;
  },

  confirmExtraction: async (brandProfileId: string): Promise<{ message: string; brandProfile: BrandProfile }> => {
    const response = await backendClient(`/api/brands/${brandProfileId}/confirm-extraction`, {
      method: 'POST',
    });

    return response;
  },
};
