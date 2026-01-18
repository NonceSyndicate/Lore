/**
 * OPERATOR Agent - Task Execution & Project Management
 * Handles operational tasks including health checks and monitoring
 */

import { supabase } from '../inngest/client';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  database: {
    connected: boolean;
    tables: string[];
  };
  agents: {
    total: number;
    idle: number;
    active: number;
    busy: number;
  };
  tasks: {
    pending: number;
    in_progress: number;
    completed: number;
  };
}

export interface MonitorTasksResult {
  timestamp: string;
  completionRate: number;
  failureRate: number;
  averageCompletionTime: number;
  tasksByType: Record<string, { completed: number; failed: number; avgTime: number }>;
  agentPerformance: Record<string, { tasksCompleted: number; avgTime: number; failureRate: number }>;
}

async function healthCheck(inputData: any): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();

  try {
    // Check database connection and tables
    const { data: agentStates, error: statesError } = await supabase
      .from('agent_state')
      .select('status')
      .limit(1);

    const dbConnected = !statesError;
    const tables = dbConnected ? ['agent_state', 'agent_tasks'] : [];

    // Get agent status distribution
    const { data: allAgents, error: agentsError } = await supabase
      .from('agent_state')
      .select('status');

    const agentCounts = {
      total: allAgents?.length || 0,
      idle: allAgents?.filter((a: any) => a.status === 'idle').length || 0,
      active: allAgents?.filter((a: any) => a.status === 'active').length || 0,
      busy: allAgents?.filter((a: any) => a.status === 'busy').length || 0,
    };

    // Get task status distribution
    const { data: allTasks, error: tasksError } = await supabase
      .from('agent_tasks')
      .select('status');

    const taskCounts = {
      pending: allTasks?.filter((t: any) => t.status === 'pending').length || 0,
      in_progress: allTasks?.filter((t: any) => t.status === 'in_progress').length || 0,
      completed: allTasks?.filter((t: any) => t.status === 'completed').length || 0,
    };

    const isHealthy = dbConnected && agentCounts.total > 0;

    return {
      status: isHealthy ? 'healthy' : (dbConnected ? 'degraded' : 'unhealthy'),
      timestamp,
      database: {
        connected: dbConnected,
        tables,
      },
      agents: agentCounts,
      tasks: taskCounts,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp,
      database: { connected: false, tables: [] },
      agents: { total: 0, idle: 0, active: 0, busy: 0 },
      tasks: { pending: 0, in_progress: 0, completed: 0 },
    };
  }
}

async function monitorTasks(inputData: any): Promise<MonitorTasksResult> {
  const timestamp = new Date().toISOString();

  try {
    const { data: allTasks, error } = await supabase
      .from('agent_tasks')
      .select('agent_type, task_type, status, created_at, completed_at');

    if (error || !allTasks) {
      return {
        timestamp,
        completionRate: 0,
        failureRate: 0,
        averageCompletionTime: 0,
        tasksByType: {},
        agentPerformance: {},
      };
    }

    // Calculate completion metrics
    const completed = allTasks.filter((t: any) => t.status === 'completed').length;
    const failed = allTasks.filter((t: any) => t.status === 'failed').length;
    const total = allTasks.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const failureRate = total > 0 ? (failed / total) * 100 : 0;

    // Calculate average completion time
    const completedTasks = allTasks.filter((t: any) => t.status === 'completed' && t.completed_at);
    const completionTimes = completedTasks.map((t: any) => {
      const created = new Date(t.created_at).getTime();
      const completed = new Date(t.completed_at).getTime();
      return completed - created;
    });
    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;

    // Group by task type
    const tasksByType: Record<string, any> = {};
    allTasks.forEach((t: any) => {
      if (!tasksByType[t.task_type]) {
        tasksByType[t.task_type] = { completed: 0, failed: 0, avgTime: 0 };
      }
      if (t.status === 'completed') {
        tasksByType[t.task_type].completed++;
      } else if (t.status === 'failed') {
        tasksByType[t.task_type].failed++;
      }
    });

    // Group by agent type
    const agentPerformance: Record<string, any> = {};
    allTasks.forEach((t: any) => {
      if (!agentPerformance[t.agent_type]) {
        agentPerformance[t.agent_type] = { tasksCompleted: 0, avgTime: 0, failureRate: 0 };
      }
      if (t.status === 'completed') {
        agentPerformance[t.agent_type].tasksCompleted++;
      }
    });

    return {
      timestamp,
      completionRate,
      failureRate,
      averageCompletionTime,
      tasksByType,
      agentPerformance,
    };
  } catch (error) {
    return {
      timestamp,
      completionRate: 0,
      failureRate: 0,
      averageCompletionTime: 0,
      tasksByType: {},
      agentPerformance: {},
    };
  }
}

export async function execute(taskType: string, inputData: any): Promise<any> {
  console.log(`[OPERATOR] Executing task: ${taskType}`);

  switch (taskType) {
    case 'health_check':
      return await healthCheck(inputData);
    case 'monitor_tasks':
      return await monitorTasks(inputData);
    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
}
