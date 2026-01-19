/**
 * OPERATOR Agent - Task Execution & Project Management
 * Handles operational tasks using AI for intelligent decision-making
 */

import { supabase } from '../inngest/client';
import { callAI, formatMissionPrompt } from '../utils/ai-provider';

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

export interface OperatorExecutionResult {
  success: boolean;
  missionId: string;
  action: string;
  aiOutput: string;
  executionDetails: Record<string, any>;
  timestamp: string;
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
    case 'mission_execution':
      return await executeMission(inputData);
    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
}

/**
 * Execute a mission using AI-driven decision making
 */
async function executeMission(mission: any): Promise<OperatorExecutionResult> {
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`[OPERATOR] Starting mission execution: ${mission.id}`);

    // Generate AI prompt from mission context
    const missionPrompt = formatMissionPrompt(mission);
    
    // Get AI guidance on mission execution
    const systemPrompt = `You are an expert Operator agent for autonomous mission execution.
Your role is to:
1. Analyze the mission objectives carefully
2. Break down complex tasks into actionable steps
3. Identify potential risks and mitigation strategies
4. Provide specific, executable recommendations
5. Track progress and suggest adaptations

Be concise, specific, and actionable in your responses.`;

    const aiResponse = await callAI(
      missionPrompt,
      systemPrompt,
      []
    );

    console.log(`[OPERATOR] AI Response (${aiResponse.provider}):`, aiResponse.content.substring(0, 200));

    // Parse AI output for action items
    const actionItems = extractActionItems(aiResponse.content);

    // Log execution results to Supabase
    if (supabase) {
      await supabase
        .from('mission_results')
        .insert({
          mission_id: mission.id,
          agent_type: 'operator',
          execution_plan: aiResponse.content,
          action_items: actionItems,
          ai_provider: aiResponse.provider,
          status: 'executed',
          created_at: timestamp,
        });

      // Update mission status
      await supabase
        .from('missions')
        .update({
          status: 'in_progress',
          started_at: timestamp,
        })
        .eq('id', mission.id);
    }

    return {
      success: true,
      missionId: mission.id,
      action: 'mission_execution',
      aiOutput: aiResponse.content,
      executionDetails: {
        provider: aiResponse.provider,
        model: aiResponse.model,
        actionItems,
        priority: mission.priority,
        objectives: mission.context?.objectives || [],
      },
      timestamp,
    };
  } catch (error) {
    console.error('[OPERATOR] Mission execution failed:', error);
    return {
      success: false,
      missionId: mission.id,
      action: 'mission_execution',
      aiOutput: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      executionDetails: { error: true },
      timestamp,
    };
  }
}

/**
 * Extract action items from AI response
 */
function extractActionItems(aiOutput: string): string[] {
  const lines = aiOutput.split('\n');
  const actionItems: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^[\d\-*•]/)) {
      const cleaned = trimmed.replace(/^[\d\-*•]\s*/, '').trim();
      if (cleaned.length > 5) {
        actionItems.push(cleaned);
      }
    }
  }
  
  return actionItems.length > 0 ? actionItems : [aiOutput.substring(0, 200)];
}
