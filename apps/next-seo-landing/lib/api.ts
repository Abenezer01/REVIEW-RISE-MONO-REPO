import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3012/api/v1';

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'on-page' | 'technical' | 'content' | 'local';
  issue: string;
  recommendation: string;
  impact: string;
}

export interface CategoryScore {
  score: number;
  maxScore: number;
  percentage: number;
  label: string;
}

export interface SEOAnalysisResult {
  url: string;
  healthScore: number;
  timestamp: string;
  snapshotId?: string;
  
  categoryScores: {
    onPage: CategoryScore;
    technical: CategoryScore;
    content: CategoryScore;
    local: CategoryScore;
  };
  
  technicalAnalysis: {
    pageSpeed: {
      score: number;
      status: string;
      loadTime: number;
    };
    mobileOptimization: {
      score: number;
      status: string;
    };
    securityHTTPS: {
      score: number;
      status: string;
    };
  };
  
  recommendations: Recommendation[];
  
  seoElements: any;
  
  summary: {
    sitesAnalyzed: number;
    accuracyRate: number;
    userRating: number;
    availability: string;
  };
}

export async function analyzeSEO(url: string): Promise<SEOAnalysisResult> {
  try {
    const response = await axios.post(`${API_URL}/seo/analyze`, { url });
    
    // Handle standardized ApiResponse format
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback error handling
    throw new Error(response.data.message || 'Failed to analyze SEO');
  } catch (error: any) {
    console.error('Full SEO Analysis Error:', error);
    console.error('SEO Analysis Error Details:', {
      message: error.message,
      code: error.code,
      responseStatus: error.response?.status,
      responseData: error.response?.data
    });
    
    // Handle standardized error response
    const errorMessage = error.response?.data?.error?.message 
      || error.response?.data?.message 
      || error.message
      || 'Failed to analyze SEO';
    throw new Error(errorMessage);
  }
}

