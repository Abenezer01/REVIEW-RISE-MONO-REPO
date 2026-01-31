import { NextResponse } from 'next/server';

import { createSuccessResponse } from '@platform/contracts';

export async function GET() {
  const response = createSuccessResponse(
    { service: 'next-web' },
    'Service is healthy',
    200
  );

  
return NextResponse.json(response, { status: response.statusCode });
}
