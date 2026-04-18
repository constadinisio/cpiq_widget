import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface HealthResponse {
  ok: true;
  service: 'cpiq-widget';
  version: string;
  timestamp: string;
}

export function GET() {
  const body: HealthResponse = {
    ok: true,
    service: 'cpiq-widget',
    version: process.env.NEXT_PUBLIC_WIDGET_VERSION || '1',
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
