/**
 * Mission System Types
 * Defines all types for the autonomous mission orchestration system
 */

export type MissionPriority = 'low' | 'medium' | 'high' | 'critical';
export type MissionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type MissionOutcome = 'success' | 'partial' | 'failed' | 'abandoned';
export type AgentRole = 'signer' | 'operator' | 'researcher' | 'scribe';
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface MissionContext {
  objectives: string[];
  tools_available: string[];
  budget_limit_usd: number;
  autonomous: boolean;
  [key: string]: any;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  priority: MissionPriority;
  status: MissionStatus;
  context: MissionContext;
  assigned_to: AgentRole;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ActionLog {
  action: string;
  result: string;
  timestamp: string;
  cost_usd?: number;
  metadata?: Record<string, any>;
}

export interface SignerContext {
  id: string;
  mission_id: string;
  conversation_history: ConversationMessage[];
  actions_taken: ActionLog[];
  current_state: Record<string, any>;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface MissionResult {
  id: string;
  mission_id: string;
  summary?: string;
  outcome: MissionOutcome;
  results: Record<string, any>;
  errors: Record<string, any>;
  execution_time_seconds?: number;
  cost_usd: number;
  completed_at: string;
  updated_at: string;
}

export interface MissionLog {
  id: string;
  mission_id: string;
  level: LogLevel;
  message: string;
  context: Record<string, any>;
  created_at: string;
}

/**
 * Mission Summary (from view)
 */
export interface MissionSummary {
  id: string;
  title: string;
  priority: MissionPriority;
  status: MissionStatus;
  assigned_to: AgentRole;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  log_count: number;
  last_log_at?: string;
}

/**
 * Mission Statistics (from view)
 */
export interface MissionStats {
  assigned_to: AgentRole;
  status: MissionStatus;
  count: number;
  avg_execution_seconds?: number;
}

/**
 * Create Mission DTO (for API requests)
 */
export interface CreateMissionInput {
  title: string;
  description: string;
  priority: MissionPriority;
  context: MissionContext;
  assigned_to?: AgentRole;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Update Mission DTO
 */
export interface UpdateMissionInput {
  title?: string;
  description?: string;
  priority?: MissionPriority;
  status?: MissionStatus;
  context?: Partial<MissionContext>;
  metadata?: Record<string, any>;
}

/**
 * Filters for mission queries
 */
export interface MissionFilters {
  status?: MissionStatus | MissionStatus[];
  priority?: MissionPriority | MissionPriority[];
  assigned_to?: AgentRole | AgentRole[];
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
}
