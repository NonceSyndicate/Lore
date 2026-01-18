import 'dotenv/config';
import { Inngest } from 'inngest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
// Use service key for server-side operations, fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const inngest = new Inngest({
  id: 'nonce-syndicate-agents',
  name: 'Nonce Syndicate Multi-Agent System',
});

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
