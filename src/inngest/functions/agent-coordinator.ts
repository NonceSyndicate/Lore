import { inngest, supabase, AgentType, AgentState, AgentTask } from '../client';

// Agent Coordinator - Manages task distribution and agent coordination
export const agentCoordinator = inngest.createFunction(
  {
    id: 'agent-coordinator',
    name: 'Agent Coordinator - Task Distribution',
  },
  { cron: '*/5 * * * *' }, // Run every 5 minutes
  async ({ event, step }) => {
    // Step 1: Find pending tasks
    const pendingTasks = await step.run('fetch-pending-tasks', async () => {
      const { data, error } = await supabase
        .from('agent_tasks')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as AgentTask[];
    });

    if (!pendingTasks || pendingTasks.length === 0) {
      return { message: 'No pending tasks found', idleAgents: 0 };
    }

    // Step 2: Find idle agents
    const idleAgents = await step.run('fetch-idle-agents', async () => {
      const { data, error } = await supabase
        .from('agent_state')
        .select('*')
        .eq('status', 'idle');
      
      if (error) throw error;
      return data as AgentState[];
    });

    if (!idleAgents || idleAgents.length === 0) {
      return { message: 'No idle agents available', pendingTasks: pendingTasks.length };
    }

    // Step 3: Assign tasks to agents
    const assignments: Array<{ task: any; agent: any }> = [];
    for (const task of pendingTasks) {
      const agent = idleAgents.find(a => a.agent_type === task.agent_type && a.status === 'idle');
      if (agent) {
        assignments.push({ task, agent });
        agent.status = 'busy'; // Mark locally as working to avoid double assignment
      }
    }

    // Step 4: Update database with assignments
    const results = await step.run('assign-tasks', async () => {
      const updates = [];
      for (const { task, agent } of assignments) {
        // Update task status
        const taskUpdate = supabase
          .from('agent_tasks')
          .update({ status: 'in_progress', updated_at: new Date().toISOString() })
          .eq('id', task.id);
        
        // Update agent status
        const agentUpdate = supabase
          .from('agent_state')
          .update({ 
            status: 'working', 
            current_task_id: task.id,
            last_active: new Date().toISOString()
          })
          .eq('id', agent.id);
        
        updates.push(Promise.all([taskUpdate, agentUpdate]));
      }
      return await Promise.all(updates);
    });

    // Step 5: Trigger agent execution functions
    await step.run('trigger-agent-execution', async () => {
      for (const { task, agent } of assignments) {
        await inngest.send({
          name: 'agent/execute-task',
          data: {
            taskId: task.id,
            agentId: agent.id,
            agentType: agent.agent_type,
          },
        });
      }
    });

    return {
      message: 'Tasks assigned successfully',
      assignedTasks: assignments.length,
      remainingPending: pendingTasks.length - assignments.length,
      idleAgents: idleAgents.length - assignments.length,
    };
  }
);
