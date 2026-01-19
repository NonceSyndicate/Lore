import { inngest, supabase, AgentTask } from '../client';
import * as scribeAgent from '../../agents/scribe';

/**
 * SCRIBE Agent - Document Update Function
 * Listens for document_update task events and generates documentation
 */
export const scribeDocumentUpdate = inngest.createFunction(
  {
    id: 'scribe-document-update',
    name: 'SCRIBE - Document Update',
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

    // Filter for SCRIBE agent and document_update task type
    if (event.data.agent_type !== 'SCRIBE' || event.data.task_type !== 'document_update') {
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

      // Step 2: Execute document update
      const result = await step.run('execute-document-update', async () => {
        return await scribeAgent.execute('document_update', task.input_data || {});
      });

      // Step 3: Store results in Supabase
      await step.run('store-document-update-results', async () => {
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
        console.log(`[SCRIBE] Document update completed for task ${task.id}`);
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
 * SCRIBE Agent - Log Summary Function
 * Listens for log_summary task events and generates daily summaries
 */
export const scribeLogSummary = inngest.createFunction(
  {
    id: 'scribe-log-summary',
    name: 'SCRIBE - Log Summary',
  },
  { event: 'agent/task.created' },
  async ({ event, step }) => {
    // Filter for SCRIBE agent and log_summary task type
    if (event.data.agent_type !== 'SCRIBE' || event.data.task_type !== 'log_summary') {
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

      // Step 2: Execute log summary generation
      const result = await step.run('execute-log-summary', async () => {
        return await scribeAgent.execute('log_summary', task.input_data || {});
      });

      // Step 3: Store results in Supabase
      await step.run('store-log-summary-results', async () => {
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
        console.log(`[SCRIBE] Log summary completed for task ${task.id}`);
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
