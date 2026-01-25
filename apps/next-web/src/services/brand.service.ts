/* eslint-disable import/no-unresolved */
import apiClient from '@/lib/apiClient';

export interface Competitor {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  type?: string;
  website?: string;
  snapshots?: any[];
  source?: string;
  relevanceScore?: number;
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

export interface ScheduledPost {
  id: string;
  businessId: string;
  locationId?: string;
  platforms: string[];
  content: {
    title?: string;
    text: string;
    hashtags?: string;
    media?: any[];
  };
  scheduledAt: string;
  timezone: string;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'canceled';
  createdAt: string;
  updatedAt: string;
  publishingJobs?: PublishingJob[];
}

export interface PublishingJob {
  id: string;
  scheduledPostId: string;
  platform: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  externalId?: string;
  error?: string;
  attemptCount: number;
  lastAttemptAt?: string;
  createdAt: string;
  updatedAt: string;
  scheduledPost?: ScheduledPost;
}

export interface PublishingLog extends PublishingJob {
  scheduledPost: ScheduledPost;
}

export const BrandService = {
  // Competitors
  listCompetitors: async (businessId: string, locationId?: string | number | null) => {
    const params: any = {};

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: Competitor[] }>(`/api/brands/${businessId}/competitors`, { params });

    return response.data.data || [];
  },

  getCompetitor: async (businessId: string, competitorId: string) => {
    const response = await apiClient.get<{ data: Competitor }>(`/api/brands/${businessId}/competitors/${competitorId}`);

    return response.data.data;
  },

  addCompetitor: async (businessId: string, data: { name: string; website?: string }) => {
    const response = await apiClient.post<{ data: Competitor }>(`/api/brands/${businessId}/competitors`, data);

    return response.data.data;
  },

  removeCompetitor: async (businessId: string, competitorId: string) => {
    await apiClient.delete(`/api/brands/${businessId}/competitors/${competitorId}`);
  },

  // Dashboard
  getOverview: async (businessId: string, locationId?: string | number | null) => {
    const params: any = {};

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: DashboardOverview }>(`/api/brands/${businessId}/dashboards/overview`, { params });

    return response.data.data;
  },

  getVisibilityMetrics: async (businessId: string, range: '7d' | '30d' | '90d' = '30d', locationId?: string | number | null) => {
    const params: any = { range };

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: VisibilityMetric[] }>(`/api/brands/${businessId}/dashboards/visibility`, { params });

    return response.data.data || [];
  },

  // Reports
  listReports: async (businessId: string, locationId?: string | number | null) => {
    const params: any = {};

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: Report[] }>(`/api/brands/${businessId}/reports`, { params });

    return response.data.data || [];
  },

  getReport: async (businessId: string, reportId: string) => {
    const response = await apiClient.get<{ data: Report & { htmlContent: string } }>(`/api/brands/${businessId}/reports/${reportId}`);

    return response.data.data;
  },

  listOpportunitiesReports: async (businessId: string) => {
    const response = await apiClient.get<{ data: any[] }>(`/api/brands/${businessId}/reports/opportunities`);

    return response.data.data || [];
  },

  generateOpportunitiesReport: async (businessId: string) => {
    const response = await apiClient.post<{ data: any }>(`/api/brands/${businessId}/reports/opportunities`);

    return response.data.data;
  },

  // DNA
  getDNA: async (businessId: string) => {
    const response = await apiClient.get<{ data: BrandDNA }>(`/api/brands/${businessId}/dna`);

    return response.data.data;
  },

  updateDNA: async (businessId: string, data: Partial<BrandDNA>) => {
    const response = await apiClient.post<{ data: BrandDNA }>(`/api/brands/${businessId}/dna`, data);

    return response.data.data;
  },

  // Content
  listContent: async (businessId: string) => {
    const response = await apiClient.get<{ data: ContentIdea[] }>(`/api/brands/${businessId}/content`);

    return response.data.data || [];
  },

  createContent: async (businessId: string, data: Partial<ContentIdea>) => {
    const response = await apiClient.post<{ data: ContentIdea }>(`/api/brands/${businessId}/content`, data);

    return response.data.data;
  },

  deleteContent: async (businessId: string, contentId: string) => {
    await apiClient.delete(`/api/brands/${businessId}/content/${contentId}`);
  },

  // Scheduling
  listScheduledPosts: async (businessId: string, locationId?: string | number | null) => {
    const params: any = {};

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: ScheduledPost[] }>(`/api/brands/${businessId}/scheduling`, { params });

    return response.data.data || [];
  },

  getScheduledPost: async (businessId: string, postId: string) => {
    const response = await apiClient.get<{ data: ScheduledPost }>(`/api/brands/${businessId}/scheduling/${postId}`);

    return response.data.data;
  },

  createScheduledPost: async (businessId: string, data: Partial<ScheduledPost>) => {
    const response = await apiClient.post<{ data: ScheduledPost }>(`/api/brands/${businessId}/scheduling`, data);

    return response.data.data;
  },

  updateScheduledPost: async (businessId: string, postId: string, data: Partial<ScheduledPost>) => {
    const response = await apiClient.patch<{ data: ScheduledPost }>(`/api/brands/${businessId}/scheduling/${postId}`, data);

    return response.data.data;
  },

  deleteScheduledPost: async (businessId: string, postId: string) => {
    await apiClient.delete(`/api/brands/${businessId}/scheduling/${postId}`);
  },

  duplicateScheduledPost: async (businessId: string, postId: string, data?: { scheduledAt?: string; status?: string }) => {
    const response = await apiClient.post<{ data: ScheduledPost }>(`/api/brands/${businessId}/scheduling/${postId}/duplicate`, data);

    return response.data.data;
  },

  listPublishingLogs: async (businessId: string, params: {
    startDate?: string;
    endDate?: string;
    platform?: string;
    status?: string;
    locationId?: string;
  }) => {
    const response = await apiClient.get<{ data: PublishingLog[] }>(`/api/brands/${businessId}/scheduling/logs`, { params });

    return response.data.data || [];
  },

  // Reviews
  listReviews: async (
    businessId: string,
    page: number = 1,
    limit: number = 10,
    platform?: string,
    locationId?: string | number | null,
    replyStatus?: string
  ) => {
    const params: any = { page, limit, platform, replyStatus };

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: { reviews: Review[], total: number, page: number, totalPages: number } }>(`/api/brands/${businessId}/reviews`, {
      params
    });

    return response.data.data || { reviews: [], total: 0, page: 1, totalPages: 1 };
  },

  postReviewReply: async (businessId: string, reviewId: string, comment: string) => {
    const response = await apiClient.post<{ data: any }>(`/api/brands/${businessId}/reviews/${reviewId}/reply`, { comment });

    return response.data;
  },

  rejectReviewReply: async (businessId: string, reviewId: string) => {
    const response = await apiClient.post<{ data: any }>(`/api/brands/${businessId}/reviews/${reviewId}/reject`);

    return response.data;
  },

  getReviewStats: async (businessId: string, locationId?: string | number | null) => {
    const params: any = {};

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: { totalReviews: number, averageRating: number } }>(`/api/brands/${businessId}/reviews/stats`, { params });

    return response.data.data;
  },

  replyReview: async (businessId: string, reviewId: string, responseContent: string) => {
    const response = await apiClient.post<{ data: Review }>(`/api/brands/${businessId}/reviews/${reviewId}/reply`, { response: responseContent });

    return response.data.data;
  },

  // Recommendations & Brand Strategist
  generateRecommendations: async (businessId: string, category: string) => {
    const response = await apiClient.post<{ message: string, jobId: string }>(`/api/brands/${businessId}/recommendations`, { category });

    return response.data;
  },

  getRecommendations: async (businessId: string, filters?: { status?: string, category?: string }) => {
    const response = await apiClient.get<BrandRecommendation[]>(`/api/brands/${businessId}/recommendations`, { params: filters });

    return response.data;
  },

  updateRecommendationStatus: async (businessId: string, id: string, status: string) => {
    const response = await apiClient.patch<{ data: BrandRecommendation }>(`/api/brands/${businessId}/recommendations/${id}`, { status });

    return response.data.data;
  },

  getBrandScores: async (businessId: string) => {
    const response = await apiClient.get<BrandScore>(`/api/brands/${businessId}/scores`);

    return response.data;
  },

  // Visibility Plan
  generateVisibilityPlan: async (businessId: string) => {
    const response = await apiClient.post<{ message: string, jobId: string }>(`/api/brands/${businessId}/visibility-plan`);

    return response.data;
  },

  getVisibilityPlan: async (businessId: string) => {
    const response = await apiClient.get<any>(`/api/brands/${businessId}/visibility-plan`);

    return response.data;
  },

  // Jobs
  listJobs: async (businessId: string, locationId?: string | number | null) => {
    const params: any = {};

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: any[] }>(`/api/brands/${businessId}/jobs`, { params });

    return response.data.data || [];
  },

  // Planner
  getMonthlyPlan: async (businessId: string, month: number, year: number, locationId?: string | null) => {
    const params: any = { month, year };

    if (locationId) params.locationId = locationId;

    const response = await apiClient.get<{ data: any }>(`/api/brands/${businessId}/planner/plan`, { params });

    return response.data.data;
  },

  generateMonthlyPlan: async (businessId: string, data: any) => {
    const response = await apiClient.post<{ data: any }>(`/api/brands/${businessId}/planner/generate`, data);

    return response.data.data;
  },

  convertPlanToDrafts: async (businessId: string, planId: string, locationId?: string | null) => {
    const params = locationId ? { locationId } : {};
    const response = await apiClient.post<{ data: any }>(`/api/brands/${businessId}/planner/convert/${planId}`, {}, { params });

    return response.data.data;
  },

  listPlannerTemplates: async (businessId: string, industry?: string) => {
    const response = await apiClient.get<{ data: any[] }>(`/api/brands/${businessId}/planner/templates`, { params: { industry } });

    return response.data.data;
  },

  createPlannerTemplate: async (businessId: string, data: any) => {
    const response = await apiClient.post<{ data: any }>(`/api/brands/${businessId}/planner/templates`, data);

    return response.data.data;
  },

  updatePlannerTemplate: async (businessId: string, templateId: string, data: any) => {
    const response = await apiClient.patch<{ data: any }>(`/api/brands/${businessId}/planner/templates/${templateId}`, data);

    return response.data.data;
  },

  deletePlannerTemplate: async (businessId: string, templateId: string) => {
    await apiClient.delete(`/api/brands/${businessId}/planner/templates/${templateId}`);
  },

  listPlannerEvents: async (businessId: string, month?: number, year?: number) => {
    const response = await apiClient.get<{ data: any[] }>(`/api/brands/${businessId}/planner/events`, { params: { month, year } });

    return response.data.data;
  },

  createPlannerEvent: async (businessId: string, data: any) => {
    const response = await apiClient.post<{ data: any }>(`/api/brands/${businessId}/planner/events`, data);

    return response.data.data;
  },

  updatePlannerEvent: async (businessId: string, eventId: string, data: any) => {
    const response = await apiClient.patch<{ data: any }>(`/api/brands/${businessId}/planner/events/${eventId}`, data);

    return response.data.data;
  },

  deletePlannerEvent: async (businessId: string, eventId: string) => {
    await apiClient.delete(`/api/brands/${businessId}/planner/events/${eventId}`);
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
