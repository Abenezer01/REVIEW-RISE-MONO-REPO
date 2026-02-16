import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { prisma } from '@platform/db';

import { getServerUser } from '@/utils/serverAuth';

import { getAuthorizedSession } from '../../../_lib';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const access = await getAuthorizedSession(sessionId, 'write');
    const currentUser = await getServerUser();

    if (!access.session) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    if (!currentUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inputs = (access.session.inputs || {}) as any;
    const shareLinks = Array.isArray(inputs.shareLinks) ? inputs.shareLinks : [];
    const shareId = crypto.randomUUID();
    const token = crypto.randomUUID().replace(/-/g, '');
    const createdAt = new Date().toISOString();

    const nextShareLinks = [
      ...shareLinks,
      {
        id: shareId,
        token,
        createdBy: currentUser.id,
        createdAt,
        revoked: false
      }
    ];

    await prisma.adriseSession.update({
      where: { id: sessionId },
      data: {
        inputs: {
          ...inputs,
          shareLinks: nextShareLinks
        }
      }
    });

    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
    const shareUrl = `${request.nextUrl.origin}/${locale}/admin/ad-rise?sharedSession=${sessionId}&shareToken=${token}`;

    return NextResponse.json({
      success: true,
      data: {
        id: shareId,
        shareUrl,
        createdAt
      }
    });
  } catch (error) {
    console.error('Failed to create share link:', error);

    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
  }
}
