'use server';

import { revalidatePath } from 'next/cache';

import { adriseSessionRepository } from '@platform/db/src/repositories/adrise-session.repository';
import { adriseSessionVersionRepository } from '@platform/db/src/repositories/adrise-session-version.repository';
import { brandDNARepository } from '@platform/db/src/repositories/brand-dna.repository';

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

export async function getBrandTone(businessId: string) {
  try {
    const brandDna = await brandDNARepository.findByBusinessId(businessId);

    return { success: true, data: brandDna?.voice || null };
  } catch (error) {
    console.error('Error fetching brand tone:', error);

    return { success: false, error: 'Failed to fetch brand tone' };
  }
}
