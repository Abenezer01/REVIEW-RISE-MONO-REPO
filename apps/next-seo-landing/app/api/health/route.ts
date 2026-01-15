import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    service: 'next-seo-landing',
    timestamp: new Date().toISOString()
  });
}
