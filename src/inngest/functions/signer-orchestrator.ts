import { inngest } from '../client';
import { supabase } from '../client';
import * as operatorAgent from '../../agents/operator';
import * as researcherAgent from '../../agents/researcher';
import * as scribeAgent from '../../agents/scribe';

// Types for mission queue
interface Mission {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  context: {
    objectives: string[];
    tools_available: string[];
    budget_limit_usd: number;
    autonomous: boolean;
  };
  assigned_to: 'signer' | 'operator' | 'researcher' | 'scribe';
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

interface SignerContext {
  mission_id: string;
  conversation_history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  actions_taken: Array<{
    action: string;
    result: string;
    timestamp: string;
  }>;
  current_state: Record<string, any>;
}

/**
 * SIGNER ORCHESTRATOR - The Autonomous Loop
 * 
 * This function runs every 30 minutes and:
 * 1. Checks for pending missions in the queue
 * 2. Selects the highest priority mission
 * 3. Prepares context for the next Signer session
 * 4. Triggers execution (via Perplexity scheduled task)
 * 5. Monitors progress and logs results
 */
export const signerOrchestrator = inngest.createFunction(
  {
    id: 'signer-orchestrator',
    name: 'Signer Orchestrator - Autonomous Mission Loop',
  },
  { cron: '*/30 * * * *' }, // Every 30 minutes
  async ({ event, step }) => {
    
    // Step 1: Get next mission from queue
    const mission = await step.run('fetch-next-mission', async () => {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('status', 'pending')
      // .eq('assigned_to', 'signer')  // REMOVED: Now fetch missions for ALL agents        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      return data as Mission | null;
    });

    // If no missions, create a default autonomous task
    if (!mission) {
      await step.run('create-default-mission', async () => {
        if (!supabase) return null;

        const defaultMission: Partial<Mission> = {
          title: 'Autonomous Operations Check',
          description: 'Review system health, check for revenue opportunities, update logs',
          priority: 'medium',
          status: 'pending',
          context: {
            objectives: [
              'Check agent function status',
              'Review pending tasks',
              'Scan for revenue opportunities',
              'Update operational logs',
              'Post status to X if needed'
            ],
            tools_available: [
              'Inngest Dashboard',
              'Vercel Deployments',
              'Supabase Database',
              'X/Twitter',
              'GitHub'
            ],
            budget_limit_usd: 0,
            autonomous: true
          },
          assigned_to: 'signer',
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('missions')
          .insert(defaultMission)
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      return {
        message: 'No missions found. Created default autonomous task.',
        next_run: 'In 30 minutes'
      };
    }

    // Step 2: Mark mission as in_progress
    await step.run('mark-mission-active', async () => {
      if (!supabase) return;

      await supabase
        .from('missions')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', mission.id);
    });

    // Step 3: Prepare Signer context
    const context = await step.run('prepare-context', async () => {
      if (!supabase) return null;

      // Get any previous context for this mission
      const { data: previousContext } = await supabase
        .from('signer_context')
        .select('*')
        .eq('mission_id', mission.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const newContext: SignerContext = {
        mission_id: mission.id,
        conversation_history: previousContext?.conversation_history || [],
        actions_taken: previousContext?.actions_taken || [],
        current_state: {
          mission,
          last_update: new Date().toISOString()
        }
      };

      // Save context
      await supabase
        .from('signer_context')
        .insert({
          mission_id: mission.id,
          conversation_history: newContext.conversation_history,
          actions_taken: newContext.actions_taken,
          current_state: newContext.current_state,
          created_at: new Date().toISOString()
        });

      return newContext;
    });

    // Step 4: Log mission briefing
    await step.run('log-mission-brief', async () => {
      console.log('='.repeat(80));
      console.log('SIGNER ORCHESTRATOR - MISSION BRIEFING');
      console.log('='.repeat(80));
      console.log(`Mission ID: ${mission.id}`);
      console.log(`Title: ${mission.title}`);
      console.log(`Priority: ${mission.priority.toUpperCase()}`);
      console.log(`Assigned To: ${mission.assigned_to?.toUpperCase() || 'SIGNER'}`);
      console.log(`Description: ${mission.description}`);
      console.log('\nObjectives:');
      mission.context.objectives.forEach((obj, i) => {
        console.log(`  ${i + 1}. ${obj}`);
      });
      console.log('\nAvailable Tools:');
      mission.context.tools_available.forEach(tool => {
        console.log(`  - ${tool}`);
      });
      console.log(`\nBudget Limit: $${mission.context.budget_limit_usd}`);
      console.log(`Autonomous Mode: ${mission.context.autonomous ? 'YES' : 'NO'}`);
      console.log('='.repeat(80));
    });

    // Step 5: Route to appropriate agent for execution
    const executionResult = await step.run('agent-execution', async () => {
      try {
        let result;
        
        switch (mission.assigned_to) {
          case 'operator':
            console.log('🤖 [OPERATOR] Taking control...');
            result = await operatorAgent.execute('mission_execution', mission);
            break;
          case 'researcher':
            console.log('🔬 [RESEARCHER] Taking control...');
            result = await researcherAgent.execute('mission_execution', mission);
            break;
          case 'scribe':
            console.log('✍️  [SCRIBE] Taking control...');
            result = await scribeAgent.execute('mission_execution', mission);
            break;
          case 'signer':
          default:
            console.log('👤 [SIGNER] Mission acknowledged. Awaiting human decision or external trigger.');
            result = { status: 'awaiting_signer_input', mission_id: mission.id };
            break;
        }
        
        return result;
      } catch (error) {
        console.error('Agent execution error:', error);
        throw error;
      }
    });

    // Step 6: Log mission execution results
    await step.run('log-execution-complete', async () => {
      console.log('\n' + '='.repeat(80));
      console.log('MISSION EXECUTION COMPLETE');
      console.log('='.repeat(80));
      console.log(`Agent: ${mission.assigned_to?.toUpperCase() || 'SIGNER'}`);
      console.log(`Status: ${executionResult?.success ? 'SUCCESS ✅' : 'PENDING ⏳'}`);
      if (executionResult?.aiOutput) {
        console.log(`Output Preview: ${executionResult.aiOutput.substring(0, 150)}...`);
      }
      console.log('='.repeat(80) + '\n');
    });

    // Step 7: Return final status
    return {
      mission_id: mission.id,
      mission_title: mission.title,
      assigned_to: mission.assigned_to,
      priority: mission.priority,
      status: 'in_progress',
      agent_execution: executionResult?.success ? 'SUCCESS' : 'PENDING',
      next_check_in: 'Next scheduled execution in 30 minutes',
      monitoring_url: `https://app.inngest.com/env/production/functions/signer-orchestrator/runs`
    };
  }
);
