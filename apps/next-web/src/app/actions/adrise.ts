'use server';

import { revalidatePath } from 'next/cache';
import axios from 'axios';

import { prisma } from '@platform/db';
import { adriseSessionRepository } from '@platform/db/src/repositories/adrise-session.repository';
import { adriseSessionVersionRepository } from '@platform/db/src/repositories/adrise-session-version.repository';
import { adriseOutputRepository } from '@platform/db/src/repositories/adrise-output.repository';
import { brandProfileRepository } from '@platform/db/src/repositories/brand-profile.repository';
import { businessRepository } from '@platform/db/src/repositories/business.repository';
import apiClient from '@/lib/apiClient';
import { SERVICES } from '@/configs/services';
import { getServerUser } from '@/utils/serverAuth';

type AdriseAccess = {
  canRead: boolean;
  canWrite: boolean;
  canRegenerate: boolean;
  canDelete: boolean;
};

const isGlobalAdmin = (user: any) => {
  const roles = Array.isArray(user?.roles) ? user.roles.map((r: string) => r?.toLowerCase()) : [];
  const role = String(user?.role || '').toLowerCase();
  const permissions = Array.isArray(user?.permissions) ? user.permissions.map((p: string) => p?.toLowerCase()) : [];

  return roles.includes('admin') || role === 'admin' || permissions.includes('admin');
};

async function getAccessForBusiness(businessId: string): Promise<AdriseAccess> {
  const user = await getServerUser();

  if (!user?.id) {
    return { canRead: false, canWrite: false, canRegenerate: false, canDelete: false };
  }

  if (isGlobalAdmin(user)) {
    return { canRead: true, canWrite: true, canRegenerate: true, canDelete: true };
  }

  const userBusinessRoles = await prisma.userBusinessRole.findMany({
    where: { userId: user.id, businessId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });

  const actions = new Set<string>();

  for (const ubr of userBusinessRoles) {
    for (const rp of ubr.role.permissions) {
      actions.add(rp.permission.action);
    }
  }

  const canRead = actions.has('adrise:read') || actions.has('adrise:write') || actions.has('adrise:regenerate');
  const canWrite = actions.has('adrise:write');
  const canRegenerate = actions.has('adrise:regenerate') || canWrite;
  const canDelete = actions.has('adrise:delete');

  return { canRead, canWrite, canRegenerate, canDelete };
}

async function getAccessForSession(sessionId: string): Promise<(AdriseAccess & { businessId?: string })> {
  const session = await adriseSessionRepository.findById(sessionId);

  if (!session) {
    return { canRead: false, canWrite: false, canRegenerate: false, canDelete: false };
  }

  const access = await getAccessForBusiness(session.businessId);

  return { ...access, businessId: session.businessId };
}

export async function getSessions(businessId: string) {
  try {
    const access = await getAccessForBusiness(businessId);

    if (!access.canRead) {
      return { success: false, error: 'Unauthorized to view AdRise sessions' };
    }

    const sessions = await adriseSessionRepository.findByBusinessId(businessId);
    const sessionIds = sessions.map((session) => session.id);
    const latestBySessionId = new Map<string, number>();

    if (sessionIds.length > 0) {
      const versionRows = await prisma.adriseSessionVersion.groupBy({
        by: ['sessionId'],
        where: {
          sessionId: {
            in: sessionIds
          }
        },
        _max: {
          versionNumber: true
        }
      });

      versionRows.forEach((row) => {
        latestBySessionId.set(row.sessionId, row._max.versionNumber || 1);
      });
    }

    const sessionsWithVersion = sessions.map((session) => ({
      ...session,
      latestVersion: latestBySessionId.get(session.id) || 1
    }));

    return { success: true, data: sessionsWithVersion };
  } catch (error) {
    console.error('Error fetching sessions:', error);

    return { success: false, error: 'Failed to fetch sessions' };
  }
}

export async function getSessionWithLatestVersion(sessionId: string) {
  try {
    const access = await getAccessForSession(sessionId);

    if (!access.canRead) {
      return { success: false, error: 'Unauthorized to view this session' };
    }

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
  output?: any;
  outputStatus?: string;
}) {
  try {
    const { sessionId, incrementVersion = false, status, output, outputStatus, ...rest } = data;

    const currentUser = await getServerUser();

    if (sessionId) {
      const access = await getAccessForSession(sessionId);

      if (!access.canWrite) {
        return { success: false, error: 'Unauthorized to edit this session' };
      }

      if (incrementVersion && !access.canRegenerate) {
        return { success: false, error: 'Unauthorized to regenerate this plan' };
      }

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

        if (output) {
          await adriseOutputRepository.create({
            session: { connect: { id: sessionId } },
            output,
            status: outputStatus || 'success'
          });
        }
      }

      revalidatePath('/admin/ad-rise');

      return { success: true, data: updated };
    } else {
      const access = await getAccessForBusiness(rest.businessId);
      const ownerUserId = rest.userId || currentUser?.id;

      if (!access.canWrite) {
        return { success: false, error: 'Unauthorized to create a session' };
      }

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
        ...(ownerUserId ? { user: { connect: { id: ownerUserId } } } : {}),
      });

      // Create initial version
      await adriseSessionVersionRepository.create({
        session: { connect: { id: created.id } },
        versionNumber: 1,
        inputs: rest.inputs,
      });

      if (incrementVersion && output) {
        await adriseOutputRepository.create({
          session: { connect: { id: created.id } },
          output,
          status: outputStatus || 'success'
        });
      }

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
    const access = await getAccessForSession(sessionId);

    if (!access.canWrite) {
      return { success: false, error: 'Unauthorized to duplicate this session' };
    }

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
    const access = await getAccessForSession(sessionId);

    if (!access.canWrite) {
      return { success: false, error: 'Unauthorized to update session status' };
    }

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
    const access = await getAccessForSession(sessionId);

    if (!access.canDelete) {
      return { success: false, error: 'Unauthorized to delete this session' };
    }

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
    const access = await getAccessForBusiness(businessId);

    if (!access.canRead) {
      return { success: false, error: 'Unauthorized to view brand tone' };
    }

    const brandProfile = await brandProfileRepository.findByBusinessId(businessId);

    if (!brandProfile) {
      return { success: true, data: null };
    }

    const normalizeText = (value: unknown) => {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();

      return trimmed.length > 0 ? trimmed : null;
    };

    const joinStrings = (arr: unknown[]) => {
      const values = arr
        .map((item) => normalizeText(item))
        .filter((item): item is string => Boolean(item));

      return values.length > 0 ? values.join(', ') : null;
    };

    const parseToneData = (rawTone: unknown) => {
      if (!rawTone) return null;

      let toneData: any = rawTone;

      if (typeof toneData === 'string') {
        const asText = normalizeText(toneData);

        if (!asText) return null;

        try {
          toneData = JSON.parse(asText);
        } catch {
          // Plain text tone value.
          return asText;
        }
      }

      if (Array.isArray(toneData)) {
        return joinStrings(toneData);
      }

      if (typeof toneData === 'object') {
        const descriptors = Array.isArray((toneData as any)?.descriptors) ? (toneData as any).descriptors : [];
        const styleWords = Array.isArray((toneData as any)?.styleWords) ? (toneData as any).styleWords : [];
        const toneList = Array.isArray((toneData as any)?.tone) ? (toneData as any).tone : [];
        const voice = normalizeText((toneData as any)?.voice);
        const preset = normalizeText((toneData as any)?.preset);
        const combined = joinStrings([...descriptors, ...styleWords, ...toneList]);

        return combined || voice || preset || null;
      }

      return null;
    };

    const fromTone = parseToneData(brandProfile.tone);
    const fromPreset = normalizeText((brandProfile as any)?.autoReplySettings?.tonePreset);
    const fromExtractedVoice = normalizeText((brandProfile as any)?.currentExtractedData?.voice);
    const fromExtractedTone = parseToneData((brandProfile as any)?.currentExtractedData?.tone);

    const resolvedTone = fromTone || fromPreset || fromExtractedVoice || fromExtractedTone;

    return { success: true, data: resolvedTone || null };
  } catch (error) {
    console.error('Error fetching brand tone:', error);

    return { success: false, error: 'Failed to fetch brand tone' };
  }
}

export async function getBusinessDetails(businessId: string) {
  try {
    const access = await getAccessForBusiness(businessId);

    if (!access.canRead) {
      return { success: false, error: 'Unauthorized to view business details' };
    }

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
    const response = await apiClient.post<any>(`${SERVICES.ai.url}/generate-campaign-narrative`, data, {
      timeout: 25000
    });

    const payload = response?.data?.data ?? response?.data ?? null;

    return { success: true, data: payload };
  } catch (error) {
    console.error('Error generating campaign narrative:', error);

    return { success: false, error: 'Failed to generate campaign narrative' };
  }
}

export async function generateChannelAllocation(data: any) {
  try {
    const response = await apiClient.post<any>(`${SERVICES.ai.url}/generate-channel-allocation`, data, {
      timeout: 25000
    });

    const payload = response?.data?.data ?? response?.data ?? null;

    return { success: true, data: payload };
  } catch (error) {
    console.error('Error generating channel allocation:', error);

    return { success: false, error: 'Failed to generate channel allocation' };
  }
}

export async function generateTroubleshootingAdvice(data: any) {
  try {
    const response = await apiClient.post<any>(`${SERVICES.ai.url}/generate-troubleshooting-advice`, data, {
      timeout: 25000
    });

    const payload = response?.data?.data ?? response?.data ?? null;

    return { success: true, data: payload };
  } catch (error) {
    console.error('Error generating troubleshooting advice:', error);

    return { success: false, error: 'Failed to generate troubleshooting advice' };
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
    const access = await getAccessForSession(sessionId);
    const currentUser = await getServerUser();

    if (!access.canWrite) {
      return { success: false, error: 'Unauthorized to update checklist' };
    }

    if (!currentUser?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    const sessionResult = await getSessionWithLatestVersion(sessionId);

    if (!sessionResult.success || !sessionResult.data) {
      return { success: false, error: 'Session not found' };
    }

    const session = sessionResult.data;
    const inputs = (session.latestInputs || session.inputs || {}) as any;
    const legacyChecklist = inputs.checklist || {};
    const checklistByUser = inputs.checklistByUser || {};
    const checklistHistory = Array.isArray(inputs.checklistHistory) ? inputs.checklistHistory : [];
    const currentUserChecklist = checklistByUser[currentUser.id] || legacyChecklist;

    const updatedChecklist = {
      ...currentUserChecklist,
      [stepId]: completed
    };

    const latestHistoryVersion = checklistHistory.reduce((max: number, entry: any) => {
      const v = typeof entry?.version === 'number' ? entry.version : 0;

      return Math.max(max, v);
    }, 0);

    const historyEntry = {
      version: latestHistoryVersion + 1,
      stepId,
      completed,
      userId: currentUser.id,
      timestamp: new Date().toISOString()
    };

    const updated = await adriseSessionRepository.update(sessionId, {
      inputs: {
        ...inputs,

        // Keep backward compatibility for existing UI/readers.
        checklist: updatedChecklist,
        checklistByUser: {
          ...checklistByUser,
          [currentUser.id]: updatedChecklist
        },
        checklistHistory: [...checklistHistory, historyEntry]
      }
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating checklist:', error);

    return { success: false, error: 'Failed to update checklist' };
  }
}

export async function getChecklist(sessionId: string) {
  try {
    const access = await getAccessForSession(sessionId);
    const currentUser = await getServerUser();

    if (!access.canRead) {
      return { success: false, error: 'Unauthorized to view checklist' };
    }

    if (!currentUser?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    const sessionResult = await getSessionWithLatestVersion(sessionId);

    if (!sessionResult.success || !sessionResult.data) {
      return { success: false, error: 'Session not found' };
    }

    const inputs = (sessionResult.data.latestInputs || sessionResult.data.inputs || {}) as any;
    const checklistByUser = inputs.checklistByUser || {};
    const checklist = checklistByUser[currentUser.id] || inputs.checklist || {};
    const checklistHistory = Array.isArray(inputs.checklistHistory) ? inputs.checklistHistory : [];
    const userHistory = checklistHistory.filter((entry: any) => entry?.userId === currentUser.id);

    return {
      success: true,
      data: {
        checklist,
        history: userHistory
      }
    };
  } catch (error) {
    console.error('Error fetching checklist:', error);

    return { success: false, error: 'Failed to fetch checklist' };
  }
}

export async function saveCustomTroubleshootingAdvice(sessionId: string, payload: {
  issue: string;
  summary: string;
  causes: string[];
  actions: string[];
}) {
  try {
    const access = await getAccessForSession(sessionId);
    const currentUser = await getServerUser();

    if (!access.canWrite) {
      return { success: false, error: 'Unauthorized to save troubleshooting advice' };
    }

    if (!currentUser?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    const sessionResult = await getSessionWithLatestVersion(sessionId);

    if (!sessionResult.success || !sessionResult.data) {
      return { success: false, error: 'Session not found' };
    }

    const session = sessionResult.data;
    const inputs = (session.latestInputs || session.inputs || {}) as any;
    const troubleshootingByUser = inputs.troubleshootingByUser || {};
    const current = Array.isArray(troubleshootingByUser[currentUser.id]) ? troubleshootingByUser[currentUser.id] : [];

    const entry = {
      id: `custom-${Date.now()}`,
      issue: payload.issue,
      summary: payload.summary,
      causes: Array.isArray(payload.causes) ? payload.causes : [],
      actions: Array.isArray(payload.actions) ? payload.actions : [],
      createdAt: new Date().toISOString()
    };

    const updated = await adriseSessionRepository.update(sessionId, {
      inputs: {
        ...inputs,
        troubleshootingByUser: {
          ...troubleshootingByUser,
          [currentUser.id]: [entry, ...current].slice(0, 10)
        }
      }
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error('Error saving troubleshooting advice:', error);

    return { success: false, error: 'Failed to save troubleshooting advice' };
  }
}

export async function getCustomTroubleshootingAdvice(sessionId: string) {
  try {
    const access = await getAccessForSession(sessionId);
    const currentUser = await getServerUser();

    if (!access.canRead) {
      return { success: false, error: 'Unauthorized to view troubleshooting advice' };
    }

    if (!currentUser?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    const sessionResult = await getSessionWithLatestVersion(sessionId);

    if (!sessionResult.success || !sessionResult.data) {
      return { success: false, error: 'Session not found' };
    }

    const inputs = (sessionResult.data.latestInputs || sessionResult.data.inputs || {}) as any;
    const troubleshootingByUser = inputs.troubleshootingByUser || {};
    const entries = Array.isArray(troubleshootingByUser[currentUser.id]) ? troubleshootingByUser[currentUser.id] : [];

    return {
      success: true,
      data: entries
    };
  } catch (error) {
    console.error('Error fetching troubleshooting advice:', error);

    return { success: false, error: 'Failed to fetch troubleshooting advice' };
  }
}
