import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { buildCampaignPlanV1, getAuthorizedSession } from '../../../_lib';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const access = await getAuthorizedSession(sessionId, 'read');

    if (!access.session) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const shareToken = request.nextUrl.searchParams.get('shareToken');

    if (shareToken) {
      const inputs = (access.session.inputs || {}) as any;
      const shareLinks = Array.isArray(inputs.shareLinks) ? inputs.shareLinks : [];
      const match = shareLinks.find((item: any) => item?.token === shareToken && item?.revoked !== true);

      if (!match) {
        return NextResponse.json({ error: 'Invalid or revoked share link' }, { status: 403 });
      }
    }

    const payload = buildCampaignPlanV1(access.session);
    const fileName = `${(payload.session.name || 'campaign-plan').replace(/[^a-zA-Z0-9-_]/g, '_')}-v1.json`;

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  } catch (error) {
    console.error('Failed to export campaign plan:', error);

    return NextResponse.json({ error: 'Failed to export campaign plan' }, { status: 500 });
  }
}
