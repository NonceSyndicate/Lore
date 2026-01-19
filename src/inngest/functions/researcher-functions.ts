import { inngest, supabase, AgentTask } from '../client';
import * as researcherAgent from '../../agents/researcher';

/**
 * RESEARCHER Agent - Market Analysis Function
 * Listens for market_analysis task events and executes market research
 */
export const researcherMarketAnalysis = inngest.createFunction(
  {
    id: 'researcher-market-analysis',
    name: 'RESEARCHER - Market Analysis',
  },
  { event: 'agent/task.created' },
  async ({ event, step }) => {
    // Validate Supabase connection
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase client not initialized',
      };
    }

    // Filter for RESEARCHER agent and market_analysis task type
    if (event.data.agent_type !== 'RESEARCHER' || event.data.task_type !== 'market_analysis') {
      return { skipped: true };
    }

    const task = event.data as AgentTask;

    try {
      // Step 1: Update task status to in_progress
      await step.run('update-task-status-started', async () => {
        const { error } = await supabase
          .from('agent_tasks')
          .update({ status: 'in_progress', updated_at: new Date().toISOString() })
          .eq('id', task.id);

        if (error) throw error;
      });

      // Step 2: Execute market analysis
      const result = await step.run('execute-market-analysis', async () => {
        return await researcherAgent.execute('market_analysis', task.input_data || {});
      });

      // Step 3: Store results in Supabase
      await step.run('store-market-analysis-results', async () => {
        const { error } = await supabase
          .from('agent_tasks')
          .update({
            status: 'completed',
            output_data: result,
            updated_at: new Date().toISOString(),
          })
          .eq('id', task.id);

        if (error) throw error;
      });

      // Step 4: Log successful completion
      await step.run('log-completion', async () => {
        console.log(`[RESEARCHER] Market analysis completed for task ${task.id}`);
      });

      return {
        success: true,
        taskId: task.id,
        result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Update task as failed
      try {
        await step.run('handle-error', async () => {
          const { error: updateError } = await supabase
            .from('agent_tasks')
            .update({
              status: 'failed',
              output_data: { error: errorMessage },
              updated_at: new Date().toISOString(),
            })
            .eq('id', task.id);

          if (updateError) {
            console.error(`Failed to update task status: ${updateError.message}`);
          }
        });
      } catch (err) {
        console.error(`Error handling failure: ${err}`);
      }

      return {
        success: false,
        taskId: task.id,
        error: errorMessage,
      };
    }
  }
);

/**
 * RESEARCHER Agent - GitHub Analysis Function
 * Listens for github_analysis task events and executes repository analysis
 */
export const researcherGithubAnalysis = inngest.createFunction(
  {
    id: 'researcher-github-analysis',
    name: 'RESEARCHER - GitHub Analysis',
  },
  { event: 'agent/task.created' },
  async ({ event, step }) => {
    // Filter for RESEARCHER agent and github_analysis task type
    if (event.data.agent_type !== 'RESEARCHER' || event.data.task_type !== 'github_analysis') {
      return { skipped: true };
    }

    const task = event.data as AgentTask;

    try {
      // Step 1: Update task status to in_progress
      await step.run('update-task-status-started', async () => {
        const { error } = await supabase
          .from('agent_tasks')
          .update({ status: 'in_progress', updated_at: new Date().toISOString() })
          .eq('id', task.id);

        if (error) throw error;
      });

      // Step 2: Execute GitHub analysis
      const result = await step.run('execute-github-analysis', async () => {
        return await researcherAgent.execute('github_analysis', task.input_data || {});
      });

      // Step 3: Store results in Supabase
      await step.run('store-github-analysis-results', async () => {
        const { error } = await supabase
          .from('agent_tasks')
          .update({
            status: 'completed',
            output_data: result,
            updated_at: new Date().toISOString(),
          })
          .eq('id', task.id);

        if (error) throw error;
      });

      // Step 4: Log successful completion
      await step.run('log-completion', async () => {
        console.log(`[RESEARCHER] GitHub analysis completed for task ${task.id}`);
      });

      return {
        success: true,
        taskId: task.id,
        result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Update task as failed
      try {
        await step.run('handle-error', async () => {
          const { error: updateError } = await supabase
            .from('agent_tasks')
            .update({
              status: 'failed',
              output_data: { error: errorMessage },
              updated_at: new Date().toISOString(),
            })
            .eq('id', task.id);

          if (updateError) {
            console.error(`Failed to update task status: ${updateError.message}`);
          }
        });
      } catch (err) {
        console.error(`Error handling failure: ${err}`);
      }

      return {
        success: false,
        taskId: task.id,
        error: errorMessage,
      };
    }
  }
);
