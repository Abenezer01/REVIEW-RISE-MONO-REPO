import { NextResponse } from 'next/server';

import { createSuccessResponse } from '@platform/contracts';

export async function GET() {
  return NextResponse.json(createSuccessResponse({
    status: 'healthy', 
    service: 'next-web'
  }, 'Service is healthy'));
}
