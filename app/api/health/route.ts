import { NextResponse } from 'next/server';
import { supabase } from '@/src/inngest/client';
import { healthCheck } from '@/src/inngest/deployment-config';

/**
 * Health Check Endpoint
 * GET /api/health
 * 
 * Used by:
 * - Vercel deployments monitoring
 * - Blue-green deployment validation
 * - Load balancer health checks
 */
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          error: 'Supabase client not initialized',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    const health = await healthCheck(supabase);

    // Return appropriate status code based on health
    const statusCode = health.status === 'healthy' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
