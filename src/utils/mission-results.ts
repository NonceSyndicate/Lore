/**
 * Mission Results Tracking System
 * Manages mission completion, deliverables, revenue, and metrics
 */

import { supabase } from '../inngest/client';

export interface MissionResult {
  mission_id: string;
  summary: string;
  outcome: 'success' | 'partial' | 'failed' | 'abandoned';
  execution_time_seconds: number;
  cost_usd: number;
  revenue_usd?: number;
  results: Record<string, any>;
  errors?: Record<string, any>;
}

export interface MissionDeliverable {
  name: string;
  description: string;
  type: 'code' | 'document' | 'analysis' | 'report' | 'other';
  content?: string;
  file_path?: string;
  github_url?: string;
}

export interface MissionMetric {
  revenue_category: string;
  amount_usd: number;
  description?: string;
  metric_name?: string;
  metric_value?: number;
}

/**
 * Complete a mission with results
 */
export async function completeMission(
  missionId: string,
  result: MissionResult
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase not initialized' };

    const { error: updateMissionError } = await supabase
      .from('missions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', missionId);

    if (updateMissionError) {
      console.error('Failed to update mission:', updateMissionError);
      return { success: false, error: updateMissionError.message };
    }

    // Record the result
    const { error: insertError } = await supabase
      .from('mission_results')
      .upsert({
        mission_id: missionId,
        summary: result.summary,
        outcome: result.outcome,
        execution_time_seconds: result.execution_time_seconds,
        cost_usd: result.cost_usd,
        revenue_usd: result.revenue_usd || 0,
        results: result.results,
        errors: result.errors,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'mission_id' });

    if (insertError) {
      console.error('Failed to insert mission result:', insertError);
      return { success: false, error: insertError.message };
    }

    // Log completion
    await logMissionEvent(missionId, 'completed', result.summary);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Exception: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Fail a mission with error details
 */
export async function failMission(
  missionId: string,
  errorMessage: string,
  details?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase not initialized' };

    const { error: updateError } = await supabase
      .from('missions')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString()
      })
      .eq('id', missionId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Record the failure
    const { error: resultError } = await supabase
      .from('mission_results')
      .upsert({
        mission_id: missionId,
        summary: `Mission failed: ${errorMessage}`,
        outcome: 'failed',
        execution_time_seconds: 0,
        cost_usd: 0,
        revenue_usd: 0,
        results: {},
        errors: {
          message: errorMessage,
          details
        },
        completed_at: new Date().toISOString()
      }, { onConflict: 'mission_id' });

    if (resultError) {
      console.error('Failed to record mission failure:', resultError);
    }

    // Log failure
    await logMissionEvent(missionId, 'failed', errorMessage);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Exception: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Add a deliverable to mission
 */
export async function addDeliverable(
  missionId: string,
  deliverable: MissionDeliverable
): Promise<{ success: boolean; deliverableId?: string; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase not initialized' };

    const { data, error } = await supabase
      .from('mission_deliverables')
      .insert({
        mission_id: missionId,
        name: deliverable.name,
        description: deliverable.description,
        type: deliverable.type,
        content: deliverable.content,
        file_path: deliverable.file_path,
        github_url: deliverable.github_url,
        status: 'completed'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to add deliverable:', error);
      return { success: false, error: error.message };
    }

    // Log event
    await logMissionEvent(
      missionId,
      'file_created',
      `Deliverable created: ${deliverable.name}`
    );

    return { success: true, deliverableId: data?.id };
  } catch (error) {
    return {
      success: false,
      error: `Exception: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Add revenue metrics to mission
 */
export async function recordMetric(
  missionId: string,
  metric: MissionMetric
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase not initialized' };

    const { error } = await supabase
      .from('mission_metrics')
      .insert({
        mission_id: missionId,
        revenue_category: metric.revenue_category,
        amount_usd: metric.amount_usd,
        description: metric.description,
        metric_name: metric.metric_name,
        metric_value: metric.metric_value
      });

    if (error) {
      console.error('Failed to record metric:', error);
      return { success: false, error: error.message };
    }

    // Log event
    await logMissionEvent(
      missionId,
      'revenue_tracked',
      `Revenue recorded: $${metric.amount_usd} - ${metric.revenue_category}`
    );

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Exception: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Get mission completion statistics
 */
export async function getMissionStats(missionId: string): Promise<any | null> {
  try {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('mission_execution_summary')
      .select('*')
      .eq('id', missionId)
      .single();

    if (error) {
      console.error('Failed to get mission stats:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception getting mission stats:', error);
    return null;
  }
}

/**
 * Get agent performance metrics
 */
export async function getAgentPerformance(agentName?: string): Promise<any[]> {
  try {
    if (!supabase) return [];

    let query = supabase
      .from('agent_performance_summary')
      .select('*');

    if (agentName) {
      query = query.eq('agent', agentName);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get agent performance:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception getting agent performance:', error);
    return [];
  }
}

/**
 * Get mission audit trail
 */
export async function getMissionAuditTrail(missionId: string): Promise<any[]> {
  try {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('mission_audit_trail')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to get audit trail:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception getting audit trail:', error);
    return [];
  }
}

/**
 * Get mission deliverables
 */
export async function getMissionDeliverables(missionId: string): Promise<any[]> {
  try {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('mission_deliverables')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get deliverables:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception getting deliverables:', error);
    return [];
  }
}

/**
 * Log a mission event
 */
export async function logMissionEvent(
  missionId: string,
  eventType: string,
  description: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    if (!supabase) return false;

    const { error } = await supabase
      .from('mission_audit_trail')
      .insert({
        mission_id: missionId,
        event_type: eventType,
        description,
        metadata: metadata || {},
        agent_name: 'system'
      });

    if (error) {
      console.error('Failed to log mission event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception logging mission event:', error);
    return false;
  }
}

/**
 * Get recent mission logs
 */
export async function getRecentMissionLogs(limit: number = 50): Promise<any[]> {
  try {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('mission_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get recent logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception getting recent logs:', error);
    return [];
  }
}

/**
 * Get all GitHub commits for a mission
 */
export async function getMissionGitHubCommits(missionId: string): Promise<any[]> {
  try {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('github_commits')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get GitHub commits:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception getting GitHub commits:', error);
    return [];
  }
}

/**
 * Get all GitHub PRs for a mission
 */
export async function getMissionGitHubPRs(missionId: string): Promise<any[]> {
  try {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('github_prs')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get GitHub PRs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception getting GitHub PRs:', error);
    return [];
  }
}

/**
 * Get total revenue for a mission
 */
export async function getMissionRevenue(missionId: string): Promise<number> {
  try {
    if (!supabase) return 0;

    const { data, error } = await supabase
      .from('mission_metrics')
      .select('amount_usd')
      .eq('mission_id', missionId);

    if (error) {
      console.error('Failed to get mission revenue:', error);
      return 0;
    }

    return (data || []).reduce((sum, m) => sum + (m.amount_usd || 0), 0);
  } catch (error) {
    console.error('Exception getting mission revenue:', error);
    return 0;
  }
}

/**
 * Generate mission completion report
 */
export async function generateMissionReport(missionId: string): Promise<any> {
  try {
    const stats = await getMissionStats(missionId);
    const deliverables = await getMissionDeliverables(missionId);
    const commits = await getMissionGitHubCommits(missionId);
    const prs = await getMissionGitHubPRs(missionId);
    const auditTrail = await getMissionAuditTrail(missionId);
    const revenue = await getMissionRevenue(missionId);

    return {
      mission: stats,
      deliverables,
      github: {
        commits,
        prs,
        totalCommits: commits.length,
        totalPRs: prs.length,
        totalAdditions: commits.reduce((sum, c) => sum + (c.insertions || 0), 0),
        totalDeletions: commits.reduce((sum, c) => sum + (c.deletions || 0), 0)
      },
      auditTrail,
      revenue,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Exception generating mission report:', error);
    return null;
  }
}
