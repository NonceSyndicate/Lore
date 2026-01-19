import { Inngest } from 'inngest';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (conditional for build-time safety)
export const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null;

// Initialize Inngest client
export const inngest = new Inngest({
  id: 'nonce-syndicate-lore',
  name: 'Nonce Syndicate Lore',
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// Type definitions for agent system
export type AgentType = 'AUDITOR' | 'NEGOTIATOR' | 'OPERATOR' | 'RESEARCHER' | 'SCRIBE';

export interface AgentState {
  id: string;
  agent_type: AgentType;
  status: 'idle' | 'active' | 'busy';
  current_task_id: string;
  last_active: string;
  metadata: Record<string, any>;
}

export interface AgentTask {
  id: string;
  agent_type: AgentType;
  task_type: string;
  parameters: Record<string, any>;
  input_data?: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  created_at: string;
  updated_at: string;
}
