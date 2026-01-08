import apiClient from '@/lib/apiClient';
import { formatShortDate, isWithinLast24Hours } from '@/utils/dateHelper';

export interface Competitor {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  type?: string;
  website?: string;
  snapshots?: any[];
}

export interface DashboardOverview {
  visibilityScore: number;
  competitorCount: number;
  recentReportCount: number;
  latestSnapshotDate: string | null;
}

export interface VisibilityMetric {
  date: string;
  score: number;
  breakdown: any;
}

export interface Report {
  id: string;
  title: string;
  version: number;
  generatedAt: string;
  generatedBy: string;
}

export interface Job {
  id: string;
  title: string;
  type: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  estimatedTime?: string;
  duration?: string;
  output?: string;
  reportId?: string;
  error?: string;
  retryCount?: string;
  target?: string;
  brand?: string;
}

export const BrandService = {
  // Competitors
  listCompetitors: async (businessId: string, locationId?: string | number | null) => {
    const params: any = {};

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: Competitor[] }>(`/brands/${businessId}/competitors`, { params });


    return response.data.data || [];
  },

  getCompetitor: async (businessId: string, competitorId: string) => {
    const response = await apiClient.get<{ data: Competitor }>(`/brands/${businessId}/competitors/${competitorId}`);


    return response.data.data;
  },

  addCompetitor: async (businessId: string, data: { name: string; website?: string }) => {
    const response = await apiClient.post<{ data: Competitor }>(`/brands/${businessId}/competitors`, data);


    return response.data.data;
  },

  removeCompetitor: async (businessId: string, competitorId: string) => {
    await apiClient.delete(`/brands/${businessId}/competitors/${competitorId}`);
  },

  // Dashboard
  getOverview: async (businessId: string, locationId?: string | number | null) => {
    const params: any = {};

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: DashboardOverview }>(`/brands/${businessId}/dashboards/overview`, { params });


    return response.data.data;
  },

  getVisibilityMetrics: async (businessId: string, range: '7d' | '30d' | '90d' = '30d', locationId?: string | number | null) => {
    const params: any = { range };

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: VisibilityMetric[] }>(`/brands/${businessId}/dashboards/visibility`, {
      params
    });


    return response.data.data || [];
  },

  // Reports
  listReports: async (businessId: string) => {
    const response = await apiClient.get<{ data: Report[] }>(`/brands/${businessId}/reports`);


    return response.data.data;
  },

  getReport: async (businessId: string, reportId: string) => {
    const response = await apiClient.get<{ data: Report & { htmlContent: string } }>(`/brands/${businessId}/reports/${reportId}`);


    return response.data.data;
  },

  listOpportunitiesReports: async (businessId: string) => {
    const response = await apiClient.get<{ data: any[] }>(`/brands/${businessId}/reports/opportunities`);


    return response.data.data || [];
  },

  generateOpportunitiesReport: async (businessId: string) => {
    const response = await apiClient.post<{ data: any }>(`/brands/${businessId}/reports/opportunities`);


    return response.data.data;
  },

  // DNA
  getDNA: async (businessId: string) => {
    const response = await apiClient.get<{ data: BrandDNA }>(`/brands/${businessId}/dna`);


    return response.data.data;
  },

  updateDNA: async (businessId: string, data: Partial<BrandDNA>) => {
    const response = await apiClient.post<{ data: BrandDNA }>(`/brands/${businessId}/dna`, data);


    return response.data.data;
  },

  // Content
  listContent: async (businessId: string) => {
    const response = await apiClient.get<{ data: ContentIdea[] }>(`/brands/${businessId}/content`);


    return response.data.data || [];
  },

  createContent: async (businessId: string, data: Partial<ContentIdea>) => {
    const response = await apiClient.post<{ data: ContentIdea }>(`/brands/${businessId}/content`, data);


    return response.data.data;
  },

  deleteContent: async (businessId: string, contentId: string) => {
    await apiClient.delete(`/brands/${businessId}/content/${contentId}`);
  },

  // Reviews
  // Reviews
  listReviews: async (businessId: string, page: number = 1, limit: number = 10, platform?: string, locationId?: string | number | null) => {
    const params: any = { page, limit, platform };

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: { reviews: Review[], total: number, page: number, totalPages: number } }>(`/brands/${businessId}/reviews`, {
      params
    });


    return response.data.data || { reviews: [], total: 0, page: 1, totalPages: 1 };
  },

  getReviewStats: async (businessId: string, locationId?: string | number | null) => {
    const params: any = {};

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: { totalReviews: number, averageRating: number } }>(`/brands/${businessId}/reviews/stats`, { params });


    return response.data.data;
  },

  replyReview: async (businessId: string, reviewId: string, responseContent: string) => {
    const response = await apiClient.post<{ data: Review }>(`/brands/${businessId}/reviews/${reviewId}/reply`, { response: responseContent });


    return response.data.data;
  },
  // Recommendations & Brand Strategist
  generateRecommendations: async (businessId: string, category: string) => {
    const response = await apiClient.post<{ message: string, jobId: string }>(`/brands/${businessId}/recommendations`, { category });
    return response.data;
  },

  getRecommendations: async (businessId: string, filters?: { status?: string, category?: string }) => {
    const response = await apiClient.get<BrandRecommendation[]>(`/brands/${businessId}/recommendations`, { params: filters });
    return response.data;
  },

  updateRecommendationStatus: async (businessId: string, id: string, status: string) => {
    const response = await apiClient.patch<{ data: BrandRecommendation }>(`/brands/${businessId}/recommendations/${id}`, { status });
    return response.data.data;
  },

  getBrandScores: async (businessId: string) => {
    const response = await apiClient.get<BrandScore>(`/brands/${businessId}/scores`);
    return response.data;
  },

  // Visibility Plan
  generateVisibilityPlan: async (businessId: string) => {
    const response = await apiClient.post<{ message: string, jobId: string }>(`/brands/${businessId}/visibility-plan`);
    return response.data;
  },

  getVisibilityPlan: async (businessId: string) => {
    const response = await apiClient.get<any>(`/brands/${businessId}/visibility-plan`);
    return response.data;
  },

  // Jobs
  listJobs: async (businessId: string) => {
    try {
      const response = await apiClient.get<{ data: Job[] }>(`/brands/${businessId}/jobs`);
      return response.data.data || [];
    } catch (error) {
      // If endpoint doesn't exist yet, return empty array (component will use mock data)
      return [];
    }
  },
};

export interface BrandRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  why: string[];
  steps: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  priorityScore: number;
  status: 'open' | 'in_progress' | 'completed' | 'dismissed';
}

export interface BrandScore {
  id: string;
  visibilityScore: number;
  trustScore: number;
  consistencyScore: number;
  visibilityBreakdown: any;
  trustBreakdown: any;
  consistencyBreakdown: any;
  computedAt: string;
}

export interface BrandDNA {
  values: string[];
  voice?: string;
  audience?: string;
  mission?: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  description?: string;
  platform: string;
  status: string;
  createdAt: string;
}

export interface Review {
  id: string;
  platform: string;
  author: string;
  rating: number;
  content?: string;
  publishedAt: string;
  response?: string;
  respondedAt?: string;
}
