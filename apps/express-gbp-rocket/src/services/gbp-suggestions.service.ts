import { prisma } from '@platform/db';

type LifecycleState = 'DRAFT' | 'SAVED' | 'APPLIED' | 'REJECTED';

type CreateSuggestionInput = {
  title: string;
  description: string;
  category?: string;
  source?: string;
  contentType?: string;
  why?: string[];
  steps?: string[];
  impact?: string;
  effort?: string;
  confidence?: number;
  priorityScore?: number;
  notes?: string | null;
  auditSnapshotId?: string | null;
  auditFindingCodes?: string[];
  lifecycleState?: LifecycleState;
};

type UpdateStateInput = {
  lifecycleState: LifecycleState;
  notes?: string | null;
  appliedDate?: string | null;
  auditSnapshotId?: string | null;
  auditFindingCodes?: string[];
};

const VALID_STATES: LifecycleState[] = ['DRAFT', 'SAVED', 'APPLIED', 'REJECTED'];

const toIso = (value: Date | string | null | undefined) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export class GbpSuggestionsService {
  private isMissingSuggestionSchemaError(error: any) {
    const message = String(error?.message || '');
    const code = String(error?.code || '');
    const metaCode = String(error?.meta?.code || '');
    const modelName = String(error?.meta?.modelName || '');

    return (
      code === 'P2021' ||
      code === 'P2022' ||
      metaCode === 'P2021' ||
      metaCode === 'P2022' ||
      modelName === 'GbpSuggestionActivity' ||
      modelName === 'BrandRecommendation' ||
      message.includes('GbpSuggestionActivity') ||
      message.includes('BrandRecommendation') ||
      message.includes('column') ||
      message.includes('does not exist')
    );
  }

  private async getLocation(locationId: string) {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      select: { id: true, businessId: true }
    });

    if (!location) {
      throw new Error('Location not found');
    }

    return location;
  }

  private async getLatestSnapshotAt(locationId: string): Promise<Date | null> {
    try {
      const snapshot = await prisma.gbpProfileSnapshot.findFirst({
        where: { locationId },
        orderBy: { capturedAt: 'desc' },
        select: { capturedAt: true }
      });

      return snapshot?.capturedAt || null;
    } catch {
      // keep suggestions API resilient when snapshot table isn't migrated yet
      return null;
    }
  }

  private getReauditGuidance(lifecycleState: string, appliedAt: Date | null, latestSnapshotAt: Date | null) {
    if (lifecycleState !== 'APPLIED') {
      return null;
    }

    if (!latestSnapshotAt) {
      return 'Take a new sync/snapshot, then run re-audit to verify impact.';
    }

    if (!appliedAt) {
      return 'Run re-audit using the latest snapshot.';
    }

    return latestSnapshotAt > appliedAt
      ? 'Ready for re-audit now. A newer snapshot exists after this suggestion was applied.'
      : 'Take a new sync/snapshot after applying this suggestion, then run re-audit.';
  }

  private normalizeState(raw: string): LifecycleState {
    const state = String(raw || '').toUpperCase() as LifecycleState;

    if (!VALID_STATES.includes(state)) {
      throw new Error('Invalid lifecycleState. Use DRAFT, SAVED, APPLIED, or REJECTED.');
    }

    return state;
  }

  private toContentType(kpiTarget: any): string | null {
    const direct = kpiTarget?.contentType;
    if (direct && typeof direct === 'string') return direct;

    const generatorType = kpiTarget?.generatorType;
    if (typeof generatorType === 'string') {
      if (generatorType === 'business_description') return 'description';
      if (generatorType === 'category_recommendations') return 'category';
      if (generatorType === 'service_descriptions') return 'service';
      if (generatorType === 'post_generator') return 'post';
      if (generatorType === 'qa_suggestions') return 'qa';
    }

    return null;
  }

  private async createActivityLog(params: {
    recommendationId: string;
    businessId: string;
    locationId: string;
    userId?: string | null;
    action: string;
    notes?: string | null;
    details?: any;
  }) {
    await prisma.gbpSuggestionActivity.create({
      data: {
        recommendationId: params.recommendationId,
        businessId: params.businessId,
        locationId: params.locationId,
        userId: params.userId || null,
        action: params.action,
        notes: params.notes || null,
        details: params.details ?? null
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: `gbp_suggestion_${params.action}`,
        entityType: 'gbp_suggestion',
        entityId: params.recommendationId,
        details: {
          locationId: params.locationId,
          notes: params.notes || null,
          ...(params.details ? { details: params.details } : {})
        }
      }
    });
  }

  async list(locationId: string, lifecycleState?: string) {
    const location = await this.getLocation(locationId);
    const latestSnapshotAt = await this.getLatestSnapshotAt(locationId);
    const normalizedState = lifecycleState ? this.normalizeState(lifecycleState) : undefined;

    let items: any[] = [];

    try {
      items = await prisma.brandRecommendation.findMany({
        where: {
          businessId: location.businessId,
          locationId,
          category: 'gbp_ai_content',
          ...(normalizedState ? { lifecycleState: normalizedState } : {})
        },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          source: true,
          lifecycleState: true,
          auditSnapshotId: true,
          auditFindingCodes: true,
          appliedAt: true,
          appliedNotes: true,
          appliedByUserId: true,
          rejectedAt: true,
          rejectedReason: true,
          updatedAt: true,
          generatedAt: true,
          kpiTarget: true
        }
      });
    } catch (error: any) {
      if (!this.isMissingSuggestionSchemaError(error)) {
        throw error;
      }

      // Legacy compatibility path before lifecycle migration is applied.
      const legacyItems = await prisma.brandRecommendation.findMany({
        where: {
          businessId: location.businessId,
          category: 'gbp_ai_content'
        },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          notes: true,
          updatedAt: true,
          generatedAt: true,
          kpiTarget: true,
          completedAt: true,
          dismissedAt: true
        }
      });

      items = legacyItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        source: 'legacy',
        lifecycleState: item.status === 'done' ? 'APPLIED' : item.status === 'dismissed' ? 'REJECTED' : 'SAVED',
        auditSnapshotId: null,
        auditFindingCodes: [],
        appliedAt: item.completedAt || null,
        appliedNotes: item.notes || null,
        appliedByUserId: null,
        rejectedAt: item.dismissedAt || null,
        rejectedReason: item.status === 'dismissed' ? item.notes || null : null,
        updatedAt: item.updatedAt,
        generatedAt: item.generatedAt,
        kpiTarget: item.kpiTarget || null
      }));

      if (normalizedState) {
        items = items.filter((item) => item.lifecycleState === normalizedState);
      }
    }

    return items.map((item) => ({
      ...item,
      contentType: this.toContentType(item?.kpiTarget),
      reAuditGuidance: this.getReauditGuidance(item.lifecycleState, item.appliedAt, latestSnapshotAt),
      latestSnapshotAt: toIso(latestSnapshotAt)
    }));
  }

  async create(locationId: string, payload: CreateSuggestionInput, userId?: string | null) {
    const location = await this.getLocation(locationId);
    const lifecycleState = this.normalizeState(payload.lifecycleState || 'SAVED');

    let created: any;

    try {
      created = await prisma.brandRecommendation.create({
        data: {
          businessId: location.businessId,
          locationId,
          category: payload.category || 'gbp_ai_content',
          source: payload.source || 'manual',
          title: payload.title,
          description: payload.description,
          why: payload.why || [],
          steps: payload.steps || [],
          impact: payload.impact || 'medium',
          effort: payload.effort || 'low',
          confidence: payload.confidence ?? 0.75,
          priorityScore: payload.priorityScore ?? 70,
          kpiTarget: payload.contentType ? { contentType: payload.contentType } : undefined,
          notes: payload.notes || null,
          status: 'open',
          lifecycleState,
          auditSnapshotId: payload.auditSnapshotId || null,
          auditFindingCodes: payload.auditFindingCodes || []
        }
      });
    } catch (error: any) {
      if (!this.isMissingSuggestionSchemaError(error)) {
        throw error;
      }

      // Legacy compatibility create before lifecycle migration is applied.
      created = await prisma.brandRecommendation.create({
        data: {
          businessId: location.businessId,
          category: payload.category || 'gbp_ai_content',
          title: payload.title,
          description: payload.description,
          why: payload.why || [],
          steps: payload.steps || [],
          impact: payload.impact || 'medium',
          effort: payload.effort || 'low',
          confidence: payload.confidence ?? 0.75,
          priorityScore: payload.priorityScore ?? 70,
          notes: payload.notes || null,
          status: lifecycleState === 'APPLIED' ? 'done' : lifecycleState === 'REJECTED' ? 'dismissed' : 'open'
        }
      });
    }

    try {
      await this.createActivityLog({
        recommendationId: created.id,
        businessId: location.businessId,
        locationId,
        userId,
        action: 'created',
        notes: payload.notes || null,
        details: {
          lifecycleState,
          source: payload.source || 'manual',
          auditSnapshotId: payload.auditSnapshotId || null,
          auditFindingCodes: payload.auditFindingCodes || []
        }
      });
    } catch (error: any) {
      if (!this.isMissingSuggestionSchemaError(error)) {
        throw error;
      }
    }

    return created;
  }

  async updateState(locationId: string, suggestionId: string, payload: UpdateStateInput, userId?: string | null) {
    const location = await this.getLocation(locationId);
    const lifecycleState = this.normalizeState(payload.lifecycleState);

    let existing: any;

    try {
      existing = await prisma.brandRecommendation.findFirst({
        where: {
          id: suggestionId,
          businessId: location.businessId,
          locationId,
          category: 'gbp_ai_content'
        }
      });
    } catch (error: any) {
      if (!this.isMissingSuggestionSchemaError(error)) {
        throw error;
      }

      existing = await prisma.brandRecommendation.findFirst({
        where: {
          id: suggestionId,
          businessId: location.businessId,
          category: 'gbp_ai_content'
        }
      });
    }

    if (!existing) {
      throw new Error('Suggestion not found');
    }

    const appliedAt = lifecycleState === 'APPLIED'
      ? (payload.appliedDate ? new Date(payload.appliedDate) : new Date())
      : null;

    let updated: any;

    try {
      updated = await prisma.brandRecommendation.update({
        where: { id: suggestionId },
        data: {
          lifecycleState,
          notes: payload.notes ?? existing.notes,
          auditSnapshotId: payload.auditSnapshotId ?? existing.auditSnapshotId,
          auditFindingCodes: payload.auditFindingCodes ?? existing.auditFindingCodes,
          status: lifecycleState === 'APPLIED' ? 'done' : lifecycleState === 'REJECTED' ? 'dismissed' : 'open',
          appliedAt,
          appliedByUserId: lifecycleState === 'APPLIED' ? (userId || null) : null,
          appliedNotes: lifecycleState === 'APPLIED' ? (payload.notes || null) : null,
          completedAt: lifecycleState === 'APPLIED' ? (appliedAt || new Date()) : null,
          rejectedAt: lifecycleState === 'REJECTED' ? new Date() : null,
          rejectedReason: lifecycleState === 'REJECTED' ? (payload.notes || null) : null,
          dismissedAt: lifecycleState === 'REJECTED' ? new Date() : null
        }
      });
    } catch (error: any) {
      if (!this.isMissingSuggestionSchemaError(error)) {
        throw error;
      }

      updated = await prisma.brandRecommendation.update({
        where: { id: suggestionId },
        data: {
          notes: payload.notes ?? existing.notes,
          status: lifecycleState === 'APPLIED' ? 'done' : lifecycleState === 'REJECTED' ? 'dismissed' : 'open',
          completedAt: lifecycleState === 'APPLIED' ? (appliedAt || new Date()) : null,
          dismissedAt: lifecycleState === 'REJECTED' ? new Date() : null
        }
      });
    }

    try {
      await this.createActivityLog({
        recommendationId: suggestionId,
        businessId: location.businessId,
        locationId,
        userId,
        action: lifecycleState.toLowerCase(),
        notes: payload.notes || null,
        details: {
          lifecycleState,
          appliedAt: toIso(appliedAt),
          auditSnapshotId: payload.auditSnapshotId ?? existing.auditSnapshotId,
          auditFindingCodes: payload.auditFindingCodes ?? existing.auditFindingCodes
        }
      });
    } catch (error: any) {
      if (!this.isMissingSuggestionSchemaError(error)) {
        throw error;
      }
    }

    const latestSnapshotAt = await this.getLatestSnapshotAt(locationId);

    return {
      ...updated,
      lifecycleState: updated.lifecycleState || lifecycleState,
      appliedAt: updated.appliedAt || appliedAt,
      reAuditGuidance: this.getReauditGuidance(updated.lifecycleState || lifecycleState, updated.appliedAt || appliedAt, latestSnapshotAt),
      latestSnapshotAt: toIso(latestSnapshotAt)
    };
  }

  async activity(locationId: string, suggestionId?: string) {
    const location = await this.getLocation(locationId);

    try {
      return await prisma.gbpSuggestionActivity.findMany({
        where: {
          businessId: location.businessId,
          locationId,
          ...(suggestionId ? { recommendationId: suggestionId } : {})
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          recommendationId: true,
          action: true,
          notes: true,
          details: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    } catch (error: any) {
      if (!this.isMissingSuggestionSchemaError(error)) {
        throw error;
      }

      return [];
    }
  }
}

export const gbpSuggestionsService = new GbpSuggestionsService();
