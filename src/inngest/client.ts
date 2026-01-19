import { Inngest } from 'inngest';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (conditional for build-time safety)
export const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) ||
    (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ? createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : null;

// Initialize Inngest client
export const inngest = new Inngest({ id: 'nonce-syndicate-lore' });

// Agent type definitions
export type AgentType = 'AUDITOR' | 'NEGOTIATOR' | 'OPERATOR' | 'RESEARCHER' | 'SCRIBE';

export interface AgentState {
  id: string;
  agent_type: AgentType;
  status: 'idle' | 'active' | 'busy';
  current_task_id?: string;
  last_active: string;
  metadata: Record<string, any>;
}

export interface AgentTask {
  id: string;
  agent_type: AgentType;
  task_type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: number;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}