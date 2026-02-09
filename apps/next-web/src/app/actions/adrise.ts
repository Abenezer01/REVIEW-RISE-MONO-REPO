'use server';

import { revalidatePath } from 'next/cache';
import axios from 'axios';

import { adriseSessionRepository } from '@platform/db/src/repositories/adrise-session.repository';
import { adriseSessionVersionRepository } from '@platform/db/src/repositories/adrise-session-version.repository';
import { brandProfileRepository } from '@platform/db/src/repositories/brand-profile.repository';
import { businessRepository } from '@platform/db/src/repositories/business.repository';
import apiClient from '@/lib/apiClient';
import { SERVICES } from '@/configs/services';

export async function getSessions(businessId: string) {
  try {
    const sessions = await adriseSessionRepository.findByBusinessId(businessId);

    return { success: true, data: sessions };
  } catch (error) {
    console.error('Error fetching sessions:', error);

    return { success: false, error: 'Failed to fetch sessions' };
  }
}

export async function getSessionWithLatestVersion(sessionId: string) {
  try {
    const session = await adriseSessionRepository.findWithDetails(sessionId);

    if (!session) return { success: false, error: 'Session not found' };

    const latestVersion = session.versions[0]; // Ordered by versionNumber desc

    return {
      success: true,
      data: {
        ...session,
        latestInputs: session.inputs || latestVersion?.inputs || {}
      }
    };
  } catch (error) {
    console.error('Error fetching session details:', error);

    return { success: false, error: 'Failed to fetch session details' };
  }
}

export async function saveSession(data: {
  sessionId?: string;
  businessId: string;
  userId?: string;
  mode: string;
  industryCode: string;
  objective: string;
  budgetMonthly: number;
  geo: any;
  inputs: any;
  status?: string;
  incrementVersion?: boolean;
}) {
  try {
    const { sessionId, incrementVersion = false, status, ...rest } = data;

    if (sessionId) {
      // Update existing session
      const updated = await adriseSessionRepository.update(sessionId, {
        mode: rest.mode,
        industryCode: rest.industryCode,
        objective: rest.objective,
        budgetMonthly: rest.budgetMonthly,
        geo: rest.geo,
        inputs: rest.inputs,
        ...(status ? { status } : {}),
      });

      if (incrementVersion) {
        // Create new version
        const latestVersionNum = await adriseSessionVersionRepository.getLatestVersionNumber(sessionId);

        await adriseSessionVersionRepository.create({
          session: { connect: { id: sessionId } },
          versionNumber: latestVersionNum + 1,
          inputs: rest.inputs,
        });
      }

      revalidatePath('/admin/ad-rise');

      return { success: true, data: updated };
    } else {
      // Create new session
      const created = await adriseSessionRepository.create({
        mode: rest.mode,
        industryCode: rest.industryCode,
        objective: rest.objective,
        budgetMonthly: rest.budgetMonthly,
        geo: rest.geo,
        inputs: rest.inputs,
        status: 'active',
        business: { connect: { id: rest.businessId } },
        ...(rest.userId ? { user: { connect: { id: rest.userId } } } : {}),
      });

      // Create initial version
      await adriseSessionVersionRepository.create({
        session: { connect: { id: created.id } },
        versionNumber: 1,
        inputs: rest.inputs,
      });

      revalidatePath('/admin/ad-rise');

      return { success: true, data: created };
    }
  } catch (error) {
    console.error('Error saving session:', error);

    return { success: false, error: 'Failed to save session' };
  }
}

export async function duplicateSession(sessionId: string) {
  try {
    const sessionResult = await getSessionWithLatestVersion(sessionId);

    if (!sessionResult.success || !sessionResult.data) {
      return { success: false, error: 'Original session not found' };
    }

    const original = sessionResult.data;

    // Create new session with original data
    const duplicated = await adriseSessionRepository.create({
      mode: original.mode,
      industryCode: original.industryCode || '',
      objective: original.objective || '',
      budgetMonthly: original.budgetMonthly || 0,
      geo: original.geo || {},
      inputs: original.latestInputs || original.inputs || {},
      status: 'active',
      business: { connect: { id: original.businessId } },
      ...(original.userId ? { user: { connect: { id: original.userId } } } : {}),
    });

    // Create initial version
    await adriseSessionVersionRepository.create({
      session: { connect: { id: duplicated.id } },
      versionNumber: 1,
      inputs: original.latestInputs || original.inputs || {},
    });

    revalidatePath('/admin/ad-rise');

    return { success: true, data: duplicated };
  } catch (error) {
    console.error('Error duplicating session:', error);

    return { success: false, error: 'Failed to duplicate session' };
  }
}

export async function updateSessionStatus(sessionId: string, status: string) {
  try {
    const updated = await adriseSessionRepository.update(sessionId, {
      status
    });

    revalidatePath('/admin/ad-rise');

    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating session status:', error);

    return { success: false, error: 'Failed to update session status' };
  }
}

export async function deleteSession(sessionId: string) {
  try {
    await adriseSessionRepository.delete(sessionId);

    revalidatePath('/admin/ad-rise');

    return { success: true };
  } catch (error) {
    console.error('Error deleting session:', error);

    return { success: false, error: 'Failed to delete session' };
  }
}

export async function getBrandTone(businessId: string) {
  try {
    console.log("Business ID", businessId);
    const brandProfile = await brandProfileRepository.findByBusinessId(businessId);

    console.log("Brand Profile", brandProfile);

    if (!brandProfile || !brandProfile.tone) {
      return { success: true, data: null };
    }

    let toneData = brandProfile.tone;

    // Handle potential stringified JSON
    if (typeof toneData === 'string') {
      try {
        toneData = JSON.parse(toneData);
      } catch (e) {
        console.error('Error parsing brand tone JSON:', e);

        return { success: true, data: null };
      }
    }

    // Extract descriptors
    const descriptors = (toneData as any)?.descriptors;

    if (Array.isArray(descriptors) && descriptors.length > 0) {
      return { success: true, data: descriptors.join(', ') };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error('Error fetching brand tone:', error);

    return { success: false, error: 'Failed to fetch brand tone' };
  }
}

export async function getBusinessDetails(businessId: string) {
  try {
    const business = await businessRepository.findById(businessId);

    return { success: true, data: business };
  } catch (error) {
    console.error('Error fetching business details:', error);

    return { success: false, error: 'Failed to fetch business details' };
  }
}

export async function scrapeOfferFromUrl(url: string, businessContext?: string) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const html = response.data;
    const truncatedHtml = typeof html === 'string' ? html.substring(0, 100000) : JSON.stringify(html).substring(0, 100000);
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3002';

    const aiResponse = await axios.post(`${aiServiceUrl}/api/v1/extract-offer`, {
      html: truncatedHtml,
      businessContext
    });

    return {
      success: true,
      data: aiResponse.data.extractedOffer
    };
  } catch (error: any) {
    console.error('Scraping Error:', error.message);

    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to extract offer. Please enter it manually.'
    };
  }
}

export async function generateCampaignNarrative(data: any) {
  try {
    const response = await apiClient.post<any>(`${SERVICES.ai.url}/generate-campaign-narrative`, data);

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error generating campaign narrative:', error);

    return { success: false, error: 'Failed to generate campaign narrative' };
  }
}

export async function recommendGoal(offer: string, industry?: string, businessContext?: string) {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3002';

    const aiResponse = await axios.post(`${aiServiceUrl}/api/v1/recommend-goal`, {
      offer,
      industry,
      businessContext
    });

    return {
      success: true,
      data: aiResponse.data.recommendedGoal
    };
  } catch (error: any) {
    console.error('Goal Recommendation Error:', error.message);

    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to recommend goal'
    };
  }
}

export async function updateChecklist(sessionId: string, stepId: string, completed: boolean) {
  try {
    const sessionResult = await getSessionWithLatestVersion(sessionId);

    if (!sessionResult.success || !sessionResult.data) {
      return { success: false, error: 'Session not found' };
    }

    const session = sessionResult.data;
    const inputs = (session.latestInputs || session.inputs || {}) as any;
    const checklist = inputs.checklist || {};

    const updatedChecklist = {
      ...checklist,
      [stepId]: completed
    };

    const updated = await adriseSessionRepository.update(sessionId, {
      inputs: {
        ...inputs,
        checklist: updatedChecklist
      }
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating checklist:', error);

    return { success: false, error: 'Failed to update checklist' };
  }
}
