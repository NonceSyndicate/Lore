/**
 * Mission Logging Helper
 * Utility functions for logging mission execution details
 */

import { supabase } from './client';
import { LogLevel, MissionLog } from '../types/missions';

export const MissionLogger = {
  /**
   * Log a mission event
   */
  log: async (
    missionId: string,
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): Promise<MissionLog | null> => {
    if (!supabase) {
      console.error('[MissionLogger] Supabase not initialized');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('mission_logs')
        .insert({
          mission_id: missionId,
          level,
          message,
          context: context || {},
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('[MissionLogger] Error logging mission event:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('[MissionLogger] Exception during logging:', err);
      return null;
    }
  },

  /**
   * Log info level
   */
  info: (missionId: string, message: string, context?: Record<string, any>) =>
    MissionLogger.log(missionId, 'INFO', message, context),

  /**
   * Log warning level
   */
  warn: (missionId: string, message: string, context?: Record<string, any>) =>
    MissionLogger.log(missionId, 'WARN', message, context),

  /**
   * Log error level
   */
  error: (missionId: string, message: string, context?: Record<string, any>) =>
    MissionLogger.log(missionId, 'ERROR', message, context),

  /**
   * Log debug level
   */
  debug: (missionId: string, message: string, context?: Record<string, any>) =>
    MissionLogger.log(missionId, 'DEBUG', message, context),

  /**
   * Add action to signer context
   */
  addAction: async (
    missionId: string,
    action: string,
    result: string,
    costUsd: number = 0
  ): Promise<void> => {
    if (!supabase) {
      console.error('[MissionLogger] Supabase not initialized');
      return;
    }

    try {
      // Get current context
      const { data: currentContext, error: fetchError } = await supabase
        .from('signer_context')
        .select('actions_taken')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[MissionLogger] Error fetching context:', fetchError);
        return;
      }

      const actionLog = {
        action,
        result,
        timestamp: new Date().toISOString(),
        cost_usd: costUsd,
      };

      const updatedActions = currentContext?.actions_taken || [];
      updatedActions.push(actionLog);

      // Update context with new action
      await supabase
        .from('signer_context')
        .update({
          actions_taken: updatedActions,
          updated_at: new Date().toISOString(),
        })
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false })
        .limit(1);
    } catch (err) {
      console.error('[MissionLogger] Exception adding action:', err);
    }
  },

  /**
   * Add conversation message to context
   */
  addMessage: async (
    missionId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<void> => {
    if (!supabase) {
      console.error('[MissionLogger] Supabase not initialized');
      return;
    }

    try {
      // Get current context
      const { data: currentContext, error: fetchError } = await supabase
        .from('signer_context')
        .select('conversation_history')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[MissionLogger] Error fetching context:', fetchError);
        return;
      }

      const message = {
        role,
        content,
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = currentContext?.conversation_history || [];
      updatedHistory.push(message);

      // Update context with new message
      await supabase
        .from('signer_context')
        .update({
          conversation_history: updatedHistory,
          updated_at: new Date().toISOString(),
        })
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false })
        .limit(1);
    } catch (err) {
      console.error('[MissionLogger] Exception adding message:', err);
    }
  },

  /**
   * Record mission completion
   */
  complete: async (
    missionId: string,
    outcome: 'success' | 'partial' | 'failed' | 'abandoned',
    summary: string,
    results: Record<string, any> = {},
    costUsd: number = 0,
    executionTimeSeconds: number = 0
  ): Promise<void> => {
    if (!supabase) {
      console.error('[MissionLogger] Supabase not initialized');
      return;
    }

    try {
      // Update mission status
      const { error: updateError } = await supabase
        .from('missions')
        .update({
          status: outcome === 'failed' ? 'failed' : 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', missionId);

      if (updateError) {
        console.error('[MissionLogger] Error updating mission:', updateError);
        return;
      }

      // Record results
      const { error: resultError } = await supabase
        .from('mission_results')
        .insert({
          mission_id: missionId,
          summary,
          outcome,
          results,
          errors: outcome === 'failed' ? { summary } : {},
          execution_time_seconds: executionTimeSeconds,
          cost_usd: costUsd,
          completed_at: new Date().toISOString(),
        });

      if (resultError) {
        console.error('[MissionLogger] Error recording results:', resultError);
        return;
      }

      // Log completion
      await MissionLogger.info(missionId, `Mission completed with outcome: ${outcome}`, {
        summary,
        cost_usd: costUsd,
        execution_time_seconds: executionTimeSeconds,
      });
    } catch (err) {
      console.error('[MissionLogger] Exception completing mission:', err);
    }
  },

  /**
   * Bulk log multiple entries
   */
  batch: async (
    missionId: string,
    logs: Array<{
      level: LogLevel;
      message: string;
      context?: Record<string, any>;
    }>
  ): Promise<void> => {
    if (!supabase) {
      console.error('[MissionLogger] Supabase not initialized');
      return;
    }

    try {
      const entries = logs.map(log => ({
        mission_id: missionId,
        level: log.level,
        message: log.message,
        context: log.context || {},
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('mission_logs')
        .insert(entries);

      if (error) {
        console.error('[MissionLogger] Error batch logging:', error);
      }
    } catch (err) {
      console.error('[MissionLogger] Exception during batch logging:', err);
    }
  },

  /**
   * Get mission logs
   */
  getLogs: async (
    missionId: string,
    level?: LogLevel,
    limit: number = 100
  ): Promise<MissionLog[]> => {
    if (!supabase) {
      console.error('[MissionLogger] Supabase not initialized');
      return [];
    }

    try {
      let query = supabase
        .from('mission_logs')
        .select('*')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (level) {
        query = query.eq('level', level);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[MissionLogger] Error fetching logs:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('[MissionLogger] Exception fetching logs:', err);
      return [];
    }
  },

  /**
   * Get mission context
   */
  getContext: async (missionId: string) => {
    if (!supabase) {
      console.error('[MissionLogger] Supabase not initialized');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('signer_context')
        .select('*')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[MissionLogger] Error fetching context:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('[MissionLogger] Exception fetching context:', err);
      return null;
    }
  },
};

/**
 * Usage Example:
 *
 * // Log during mission execution
 * await MissionLogger.info(missionId, 'Started market analysis');
 *
 * // Add actions taken
 * await MissionLogger.addAction(missionId, 'check_dex_pools', 'Found 5 opportunities', 2.50);
 *
 * // Track conversation
 * await MissionLogger.addMessage(missionId, 'user', 'Analyze this opportunity');
 * await MissionLogger.addMessage(missionId, 'assistant', 'Analysis complete...');
 *
 * // Complete mission
 * await MissionLogger.complete(
 *   missionId,
 *   'success',
 *   'Found 3 profitable arbitrage opportunities',
 *   { opportunities: [...] },
 *   3.50,
 *   45
 * );
 */
