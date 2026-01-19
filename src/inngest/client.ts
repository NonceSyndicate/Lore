import 'dotenv/config';
import { Inngest } from 'inngest';
import { createClient } from '@supabase/supabase-js';

// Use NEXT_PUBLIC_ vars which are available at build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if we have the required values (runtime check)
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null as any; // Placeholder for build time

export const inngest = new Inngest({
  id: 'nonce-syndicate-agents',
  name: 'Nonce Syndicate Multi-Agent System',
});

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