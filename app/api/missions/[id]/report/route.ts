import { NextResponse } from 'next/server';
import { supabase } from '@/src/inngest/client';
import { generateMissionReport } from '@/src/utils/mission-results';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const missionId = params.id;

    // Validate mission exists
    const { data: mission, error: missionError } = await supabase
      .from('missions')
      .select('*')
      .eq('id', missionId)
      .single();

    if (missionError || !mission) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
    }

    // Generate full report
    const report = await generateMissionReport(missionId);

    if (!report) {
      return NextResponse.json(
        { error: 'Failed to generate report' },
        { status: 500 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Failed to generate report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Export report as JSON or PDF
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const missionId = params.id;
    const { format = 'json' } = await request.json();

    const report = await generateMissionReport(missionId);

    if (!report) {
      return NextResponse.json(
        { error: 'Failed to generate report' },
        { status: 500 }
      );
    }

    if (format === 'json') {
      return NextResponse.json(report);
    }

    // Format for export
    const exportData = {
      title: report.mission?.title,
      mission_id: missionId,
      status: report.mission?.status,
      agent: report.mission?.assigned_to,
      execution_time: report.mission?.execution_time,
      revenue: report.revenue,
      deliverables_count: report.deliverables.length,
      github_commits: report.github.totalCommits,
      github_prs: report.github.totalPRs,
      generated_at: report.generatedAt,
      deliverables: report.deliverables,
      github_activity: report.github,
      audit_trail: report.auditTrail.map(e => ({
        event: e.event_type,
        description: e.description,
        time: e.created_at,
        agent: e.agent_name
      }))
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Failed to process report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
