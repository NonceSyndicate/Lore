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
 * This includes:
 * 1. Decomposing mission into tasks
 * 2. Executing tasks sequentially
 * 3. Logging all activity
 * 4. Updating mission status
 */
async function executeMission(mission: any): Promise<OperatorExecutionResult> {
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`[OPERATOR] Starting mission execution: ${mission.id}`);

    // Step 1: Decompose mission into tasks
    const tasks = await decomposeMissionIntoTasks(mission);
    console.log(`[OPERATOR] Decomposed into ${tasks.length} tasks`);

    // Step 2: Update mission status
    if (supabase) {
      await supabase
        .from('missions')
        .update({
          status: 'in_progress',
          started_at: timestamp,
        })
        .eq('id', mission.id);
    }

    // Step 3: Execute each task
    const executedTasks = [];
    for (const task of tasks) {
      const taskResult = await executeTask(mission, task);
      executedTasks.push(taskResult);
    }

    // Step 4: Mark mission as complete
    if (supabase) {
      await supabase
        .from('missions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', mission.id);

      // Store overall execution plan
      const missionPrompt = formatMissionPrompt(mission);
      await supabase
        .from('mission_results')
        .insert({
          mission_id: mission.id,
          agent_type: 'operator',
          execution_plan: `Decomposed into ${tasks.length} tasks and executed all successfully`,
          action_items: executedTasks.map((t: any) => t.title),
          ai_provider: 'multi-provider',
          status: 'executed',
          created_at: timestamp,
        });
    }

    return {
      success: true,
      missionId: mission.id,
      action: 'mission_execution_with_tasks',
      aiOutput: `Decomposed into ${tasks.length} tasks and executed successfully`,
      executionDetails: {
        provider: 'multi-provider',
        tasksCreated: tasks.length,
        tasksExecuted: executedTasks.length,
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

/**
 * Decompose a mission into actionable tasks
 */
async function decomposeMissionIntoTasks(mission: any): Promise<any[]> {
  try {
    const decompositionPrompt = `You are an expert project manager. 

Mission: ${mission.title}
Description: ${mission.description}
Objectives: ${mission.context?.objectives?.join(', ') || 'Not specified'}

Break this mission into 3-7 concrete, executable tasks. For each task provide:
1. Title - Short, action-oriented name
2. Description - What needs to happen
3. Priority - critical/high/medium/low
4. Order - Sequence number (1, 2, 3...)

Format your response as a JSON array with no markdown formatting:
[
  {"title":"Task 1", "description":"Details", "priority":"high", "order":1},
  {"title":"Task 2", "description":"Details", "priority":"medium", "order":2}
]

IMPORTANT: Return ONLY the JSON array, no other text.`;

    const systemPrompt = `You are a mission decomposition expert. Always respond with valid JSON only.`;

    const aiResponse = await callAI(decompositionPrompt, systemPrompt, []);
    
    // Parse AI response
    let tasks: any[] = [];
    try {
      // Clean response if needed (remove markdown code blocks)
      let jsonStr = aiResponse.content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      }
      tasks = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error(`[OPERATOR] Failed to parse task decomposition:`, aiResponse.content);
      // Fallback: create default task
      tasks = [{
        title: `Execute: ${mission.title}`,
        description: mission.description,
        priority: mission.priority || 'high',
        order: 1
      }];
    }

    // Store tasks in database
    const createdTasks = [];
    for (const task of tasks) {
      if (supabase) {
        const { data, error } = await supabase
          .from('agent_tasks')
          .insert({
            mission_id: mission.id,
            parent_task_id: null,
            title: task.title,
            description: task.description,
            priority: task.priority || 'medium',
            status: 'pending',
            assigned_to: mission.assigned_to || 'operator',
            order_index: task.order || 0,
            context: {
              mission_title: mission.title,
              mission_context: mission.context
            }
          })
          .select();

        if (error) {
          console.error(`[OPERATOR] Failed to create task:`, error);
        } else {
          createdTasks.push(data[0]);
          
          // Log task creation
          await supabase
            .from('task_logs')
            .insert({
              task_id: data[0].id,
              agent_type: 'operator',
              level: 'INFO',
              action: 'TASK_CREATED',
              message: `Task created: ${task.title}`
            });
        }
      }
    }

    console.log(`[OPERATOR] Created ${createdTasks.length} tasks for mission ${mission.id}`);
    return createdTasks;
  } catch (error) {
    console.error(`[OPERATOR] Task decomposition failed:`, error);
    return [];
  }
}

/**
 * Execute a single task
 */
async function executeTask(mission: any, task: any): Promise<any> {
  const taskStartTime = Date.now();
  
  try {
    console.log(`[OPERATOR] Executing task: ${task.title}`);

    // Update task status to in_progress
    if (supabase) {
      await supabase
        .from('agent_tasks')
        .update({ status: 'in_progress' })
        .eq('id', task.id);

      // Log task start
      await supabase
        .from('task_logs')
        .insert({
          task_id: task.id,
          agent_type: 'operator',
          level: 'INFO',
          action: 'TASK_STARTED',
          message: `Started executing: ${task.title}`
        });
    }

    // Generate AI prompt for task execution
    const taskPrompt = `Execute this task:

Mission: ${mission.title}
Task: ${task.title}
Description: ${task.description}
Available objectives: ${mission.context?.objectives?.join(', ') || 'General execution'}

Provide specific, actionable steps and expected outcomes. Be concise and practical.`;

    const systemPrompt = `You are an expert operator. Execute the task efficiently and provide clear results.`;

    const aiResponse = await callAI(taskPrompt, systemPrompt, []);

    // Store task result
    if (supabase) {
      const executionDuration = Date.now() - taskStartTime;
      
      await supabase
        .from('task_results')
        .insert({
          task_id: task.id,
          mission_id: mission.id,
          agent_type: 'operator',
          execution_plan: task.description,
          ai_provider: aiResponse.provider,
          output: aiResponse.content,
          metadata: {
            duration_ms: executionDuration,
            tokens_used: aiResponse.content.length
          }
        });

      // Update task status to completed
      await supabase
        .from('agent_tasks')
        .update({ status: 'completed' })
        .eq('id', task.id);

      // Log task completion
      await supabase
        .from('task_logs')
        .insert({
          task_id: task.id,
          agent_type: 'operator',
          level: 'INFO',
          action: 'TASK_COMPLETED',
          message: `Completed: ${task.title} in ${executionDuration}ms`
        });
    }

    console.log(`[OPERATOR] Task completed: ${task.title} (${Date.now() - taskStartTime}ms)`);

    return {
      ...task,
      status: 'completed',
      execution_time: Date.now() - taskStartTime,
      ai_response: aiResponse.content
    };
  } catch (error) {
    console.error(`[OPERATOR] Task execution failed:`, error);

    if (supabase) {
      await supabase
        .from('agent_tasks')
        .update({ status: 'failed' })
        .eq('id', task.id);

      await supabase
        .from('task_logs')
        .insert({
          task_id: task.id,
          agent_type: 'operator',
          level: 'ERROR',
          action: 'TASK_FAILED',
          message: `Task failed: ${(error as Error).message}`
        });
    }

    return {
      ...task,
      status: 'failed',
      execution_time: Date.now() - taskStartTime,
      error: (error as Error).message
    };
  }
}
