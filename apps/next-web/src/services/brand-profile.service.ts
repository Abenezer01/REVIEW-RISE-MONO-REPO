/* eslint-disable import/no-unresolved */
import { backendClient } from '@/utils/backendClient';

export interface BrandProfile {
  id: string;
  websiteUrl: string;
  title?: string;
  description?: string;
  status: 'pending' | 'extracting' | 'completed' | 'failed' | 'pending_confirmation';
  currentExtractedData: any;
  extractedDataVersions: {
    id: string;
    brandProfileId: string;
    versionNumber: number;
    extractedData: any;
    createdAt: string | Date;
  }[];
  createdAt: string | Date;
  updatedAt: string | Date;
  business?: {
    id: string;
    name: string;
  };
  assets?: Array<{ type: string; url: string; altText?: string }>;
  colors?: Array<{ hexCode: string; type: string }>;
  fonts?: Array<{ family: string; usage: string; url?: string }>;
  socialLinks?: Array<{ platform: string; url: string }>;
  tone?: {
    descriptors: string[];
    writingRules: { do: string[]; dont: string[] };
    taglines: string[];
    messagingPillars: { pillar: string; description: string; ctas: string[] }[];
  };
}

interface PaginatedBrandProfiles {
  data: BrandProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const BrandProfileService = {
  getAllBrandProfiles: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    businessId?: string;
    status?: string;
  }): Promise<PaginatedBrandProfiles> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.businessId) queryParams.append('businessId', params.businessId);
    if (params?.status) queryParams.append('status', params.status);

    const response = await backendClient(`/api/brands?${queryParams.toString()}`, {
      method: 'GET',
    });

    return response;
  },

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

  getAuditLogs: async (id: string): Promise<any[]> => {
    const response = await backendClient(`/api/brands/${id}/logs`, {
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

  deleteBrandProfile: async (id: string): Promise<{ message: string }> => {
    const response = await backendClient(`/api/brands/${id}`, {
      method: 'DELETE',
    });

    return response;
  },

  reExtractBrandProfile: async (id: string): Promise<{ message: string; brandProfileId: string }> => {
    const response = await backendClient(`/api/brands/${id}/re-extract`, {
      method: 'POST',
    });

    return response;
  },

  generateBrandTone: async (id: string, industry?: string, location?: string): Promise<any> => {
    const response = await backendClient(`/api/brands/${id}/generate-tone`, {
      method: 'POST',
      data: { industry, location },
    });

    return response;
  },

  updateBrandProfile: async (id: string, data: Partial<BrandProfile>): Promise<BrandProfile> => {
    const response = await backendClient(`/api/brands/${id}`, {
      method: 'PATCH',
      data,
    });

    return response;
  },
};
