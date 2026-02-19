import { prisma } from '@platform/db';

import { getServerUser } from '@/utils/serverAuth';

export type AdriseAccessMode = 'read' | 'write';

const hasGlobalAdminAccess = (user: any) => {
  const roles = Array.isArray(user?.roles) ? user.roles.map((r: string) => r?.toLowerCase()) : [];
  const role = String(user?.role || '').toLowerCase();
  const permissions = Array.isArray(user?.permissions) ? user.permissions.map((p: string) => p?.toLowerCase()) : [];

  return roles.includes('admin') || role === 'admin' || permissions.includes('admin');
};

export async function getAuthorizedSession(sessionId: string, mode: AdriseAccessMode = 'read') {
  const user = await getServerUser();

  if (!user?.id) return { session: null, error: 'Unauthorized', status: 401 } as const;

  const session = await prisma.adriseSession.findUnique({
    where: { id: sessionId },
    include: {
      outputs: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 1
      }
    }
  });

  if (!session) return { session: null, error: 'Session not found', status: 404 } as const;

  if (hasGlobalAdminAccess(user)) return { session, error: null, status: 200 } as const;

  const userBusinessRoles = await prisma.userBusinessRole.findMany({
    where: { userId: user.id, businessId: session.businessId },
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
  const canWrite = actions.has('adrise:write') || actions.has('adrise:regenerate');
  const allowed = mode === 'write' ? canWrite : canRead;

  if (!allowed) {
    return { session: null, error: 'Forbidden', status: 403 } as const;
  }

  return { session, error: null, status: 200 } as const;
}

const getCampaignDays = (inputs: any) => {
  const start = inputs?.campaignStart;
  const end = inputs?.campaignEnd;

  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate >= startDate) {
      const diffMs = endDate.getTime() - startDate.getTime();

      return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};

export function buildCampaignPlanV1(session: any) {
  const inputs = (session.inputs || session.versions?.[0]?.inputs || {}) as any;
  const latestOutput = (session.outputs?.[0]?.output || {}) as any;
  const plan = latestOutput.plan || {};

  const allocation = plan.allocation || {
    google: { awareness: 20, consideration: 40, conversion: 40 },
    meta: { awareness: 30, consideration: 40, conversion: 30 },
    channelSplit: { google: 50, meta: 50 },
    tradeoffs: []
  };

  const campaignDays = latestOutput?.inputs?.campaignDays || getCampaignDays(inputs);
  const dailyBudget = latestOutput?.inputs?.budgetDaily || Math.round((session.budgetMonthly || 0) / Math.max(1, campaignDays));

  return {
    schemaVersion: 'campaign-plan.v1',
    exportedAt: new Date().toISOString(),
    session: {
      id: session.id,
      status: session.status,
      mode: session.mode,
      businessId: session.businessId,
      userId: session.userId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      name: inputs.sessionName || 'Unnamed Session'
    },
    strategy: {
      objective: session.objective || inputs.goal || null,
      industry: session.industryCode || inputs.industry || null,
      offer: inputs.offer || null,
      locations: session.geo || inputs.locations || [],
      timeline: {
        campaignStart: inputs.campaignStart || null,
        campaignEnd: inputs.campaignEnd || null
      },
      rationale: plan.narrative || null,
      assumptions: plan.assumptions || []
    },
    google: {
      channelSplit: allocation.channelSplit?.google ?? 50,
      funnelStages: allocation.google || {}
    },
    meta: {
      channelSplit: allocation.channelSplit?.meta ?? 50,
      funnelStages: allocation.meta || {}
    },
    creatives: {
      brandTone: inputs.brandTone || null,
      notes: inputs.audienceNotes || null
    },
    budget: {
      monthly: session.budgetMonthly || 0,
      daily: dailyBudget,
      campaignDays,
      seasonality: inputs.seasonality || 'none',
      seasonalityStart: inputs.seasonalityStart || null,
      seasonalityEnd: inputs.seasonalityEnd || null,
      promoWindow: inputs.promoWindow || null,
      pacing: inputs.pacing || 'even',
      pacingCurve: plan.pacingCurve || [],
      tradeoffs: allocation.tradeoffs || []
    },
    execution: {
      checklist: inputs.checklist || {},
      milestones: [
        { day: 1, task: 'Launch campaign and verify tracking' },
        { day: 3, task: 'Review search terms and placements' },
        { day: 7, task: 'Split test copy and adjust budget' },
        { day: 14, task: 'Reallocate to winners and expand coverage' }
      ]
    },
    raw: {
      inputs,
      output: latestOutput || null
    }
  };
}
