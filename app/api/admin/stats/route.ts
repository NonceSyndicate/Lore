import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export async function GET() {
  try {
    // Get mission statistics
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (missionsError) throw missionsError;

    // Calculate stats
    const stats = {
      total_missions: missions?.length || 0,
      pending: missions?.filter((m: any) => m.status === 'pending').length || 0,
      in_progress: missions?.filter((m: any) => m.status === 'in_progress').length || 0,
      completed: missions?.filter((m: any) => m.status === 'completed').length || 0,
      failed: missions?.filter((m: any) => m.status === 'failed').length || 0,
    };

    // Get recent logs
    const { data: logs, error: logsError } = await supabase
      .from('mission_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (logsError) throw logsError;

    // Get mission queue (pending + in_progress)
    const missionQueue = missions
      ?.filter((m: any) => ['pending', 'in_progress'].includes(m.status))
      .sort((a: any, b: any) => {
        const priorityOrder: Record<string, number> = {
          critical: 1,
          high: 2,
          medium: 3,
          low: 4,
        };
        return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
      })
      .slice(0, 15) || [];

    return NextResponse.json({
      ...stats,
      recent_logs: logs || [],
      mission_queue: missionQueue,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
