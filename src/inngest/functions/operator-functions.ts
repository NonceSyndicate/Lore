import { inngest, supabase, AgentTask } from '../client';
import * as operatorAgent from '../../agents/operator';

/**
 * OPERATOR Agent - Health Check Function
 * Listens for health_check task events and executes health checks
 */
export const operatorHealthCheck = inngest.createFunction(
  {
    id: 'operator-health-check',
    name: 'OPERATOR - Health Check',
  },
  { event: 'agent/task.created' },
  async ({ event, step }) => {
    // Filter for OPERATOR agent and health_check task type
    if (event.data.agent_type !== 'OPERATOR' || event.data.task_type !== 'health_check') {
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

      // Step 2: Execute health check
      const result = await step.run('execute-health-check', async () => {
        return await operatorAgent.execute('health_check', task.input_data || {});
      });

      // Step 3: Store results in Supabase
      await step.run('store-health-check-results', async () => {
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
        console.log(`[OPERATOR] Health check completed for task ${task.id}`);
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
 * OPERATOR Agent - Monitor Tasks Function
 * Listens for monitor_tasks task events and executes task monitoring
 */
export const operatorMonitorTasks = inngest.createFunction(
  {
    id: 'operator-monitor-tasks',
    name: 'OPERATOR - Monitor Tasks',
  },
  { event: 'agent/task.created' },
  async ({ event, step }) => {
    // Filter for OPERATOR agent and monitor_tasks task type
    if (event.data.agent_type !== 'OPERATOR' || event.data.task_type !== 'monitor_tasks') {
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

      // Step 2: Execute task monitoring
      const result = await step.run('execute-monitor-tasks', async () => {
        return await operatorAgent.execute('monitor_tasks', task.input_data || {});
      });

      // Step 3: Store results in Supabase
      await step.run('store-monitoring-results', async () => {
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
        console.log(`[OPERATOR] Task monitoring completed for task ${task.id}`);
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
