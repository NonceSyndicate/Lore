import { NextResponse } from 'next/server';
import { supabase } from '@/src/inngest/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const missionData = {
      title: body.title,
      description: body.description,
      priority: body.priority || 'medium',
      status: 'pending',
      context: body.context || {
        objectives: [],
        tools_available: [],
        budget_limit_usd: 0,
        autonomous: false
      },
      assigned_to: body.assigned_to || 'signer',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('missions')
      .insert([missionData])
      .select()
      .single();

    if (error) {
      console.error('Failed to create mission:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Log mission creation
    await supabase
      .from('mission_audit_trail')
      .insert({
        mission_id: data.id,
        event_type: 'created',
        description: `Mission created: ${missionData.title}`,
        metadata: { source: 'api' },
        agent_name: 'system'
      });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to create mission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assigned_to = searchParams.get('assigned_to');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('mission_execution_summary')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch missions:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ missions: data, total: data?.length || 0 });
  } catch (error) {
    console.error('Failed to fetch missions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
