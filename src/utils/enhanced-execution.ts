/**
 * Enhanced Agent Execution Handler
 * Demonstrates real work execution: GitHub operations, file creation, code generation
 */

import { supabase } from '../inngest/client';
import { callAI, formatMissionPrompt } from './ai-provider';
import * as githubIntegration from './github-integration';
import * as missionResults from './mission-results';

interface Mission {
  id: string;
  title: string;
  description: string;
  priority: string;
  context: {
    objectives: string[];
    tools_available: string[];
    budget_limit_usd: number;
    autonomous: boolean;
  };
  assigned_to: string;
}

interface ExecutionContext {
  mission: Mission;
  startTime: number;
  filesCreated: string[];
  commitsGenerated: string[];
  prsCreated: number[];
  revenue: number;
}

/**
 * Generate code using AI based on mission objectives
 */
export async function generateCode(
  objective: string,
  context: string
): Promise<string | null> {
  try {
    const systemPrompt = `You are an expert TypeScript/JavaScript code generator. 
Generate clean, production-ready code that follows best practices.
The code should be complete and ready to use.`;

    const response = await callAI(
      [{ role: 'user', content: `${context}\n\nObjective: ${objective}` }],
      systemPrompt
    );

    return response?.content || null;
  } catch (error) {
    console.error('Failed to generate code:', error);
    return null;
  }
}

/**
 * Execute a code generation task
 */
export async function executeCodeGeneration(
  missionId: string,
  objective: string,
  fileName: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    console.log(`[CODE GENERATION] Generating ${fileName} for objective: ${objective}`);

    // Generate code using AI
    const code = await generateCode(
      objective,
      `Generate TypeScript code for the following objective:\n${objective}`
    );

    if (!code) {
      return { success: false, error: 'Code generation failed' };
    }

    // Commit to GitHub and create PR
    const result = await githubIntegration.generateAndCommitCode(
      missionId,
      fileName,
      code,
      objective
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Record deliverable
    await missionResults.addDeliverable(missionId, {
      name: fileName,
      description: objective,
      type: 'code',
      content: code,
      file_path: result.path,
      github_url: `https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/blob/main/${result.path}`
    });

    console.log(`✅ [CODE GENERATION] Successfully generated and committed ${fileName}`);
    return { success: true, path: result.path };
  } catch (error) {
    console.error('Code generation execution failed:', error);
    return { success: false, error: `Exception: ${error instanceof Error ? error.message : String(error)}` };
  }
}

/**
 * Execute a GitHub operations task
 */
export async function executeGitHubOperations(
  missionId: string,
  operations: Array<{ type: 'branch' | 'file' | 'pr'; config: any }>
): Promise<{ success: boolean; results: any[] }> {
  const results = [];
  const config = githubIntegration.getGitHubConfig();

  if (!config) {
    return { success: false, results: [{ error: 'GitHub not configured' }] };
  }

  try {
    for (const op of operations) {
      switch (op.type) {
        case 'branch':
          const branchResult = await githubIntegration.createBranch(config, op.config.name);
          results.push(branchResult);
          if (branchResult.success) {
            await githubIntegration.logGitHubAction(missionId, 'branch_created', branchResult);
          }
          break;

        case 'file':
          const fileResult = await githubIntegration.createOrUpdateFile(
            config,
            op.config.path,
            op.config.content,
            op.config.message,
            op.config.branch
          );
          results.push(fileResult);
          if (fileResult.success) {
            await githubIntegration.logGitHubAction(missionId, 'file_created', fileResult);
          }
          break;

        case 'pr':
          const prResult = await githubIntegration.createPullRequest(
            config,
            op.config.title,
            op.config.description,
            op.config.sourceBranch,
            op.config.targetBranch
          );
          results.push(prResult);
          if (prResult.success) {
            await githubIntegration.recordPR(
              missionId,
              prResult.prNumber,
              prResult.url,
              op.config.title,
              op.config.description,
              op.config.sourceBranch,
              op.config.targetBranch
            );
          }
          break;
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('GitHub operations failed:', error);
    return { success: false, results: [{ error: String(error) }] };
  }
}

/**
 * Execute real work: analyze mission objectives and perform actual tasks
 */
export async function executeRealWork(context: ExecutionContext): Promise<{
  success: boolean;
  summary: string;
  results: Record<string, any>;
  errors: Record<string, any>;
}> {
  const errors: Record<string, any> = {};
  const results: Record<string, any> = {
    tasks_executed: [],
    files_created: [],
    commits: [],
    prs: [],
  };

  try {
    console.log(`\n🚀 [REAL WORK EXECUTION] Starting autonomous work for mission: ${context.mission.id}`);

    // Parse objectives and create work plan
    const objectives = context.mission.context.objectives || [];
    console.log(`📋 Objectives: ${objectives.join(', ')}`);

    // Example: Generate code files for objectives
    for (let i = 0; i < Math.min(objectives.length, 3); i++) {
      const objective = objectives[i];
      const fileName = `generated-module-${i + 1}.ts`;

      console.log(`\n[TASK ${i + 1}/${Math.min(objectives.length, 3)}] Executing: ${objective}`);

      const genResult = await executeCodeGeneration(context.mission.id, objective, fileName);

      if (genResult.success) {
        results.files_created?.push({ file: fileName, path: genResult.path });
        results.tasks_executed?.push({
          objective,
          status: 'completed',
          file_created: fileName
        });
      } else {
        errors[`task_${i + 1}`] = genResult.error;
        results.tasks_executed?.push({
          objective,
          status: 'failed',
          error: genResult.error
        });
      }
    }

    // Log metrics
    const executionTime = (Date.now() - context.startTime) / 1000;
    results.execution_stats = {
      execution_time_seconds: executionTime,
      tasks_completed: results.tasks_executed?.filter((t: any) => t.status === 'completed').length || 0,
      tasks_failed: results.tasks_executed?.filter((t: any) => t.status === 'failed').length || 0,
      files_created: results.files_created?.length || 0,
      commits: context.commitsGenerated.length,
      prs: context.prsCreated.length,
    };

    const hasErrors = Object.keys(errors).length > 0;
    const outcome = hasErrors && results.tasks_executed?.every((t: any) => t.status === 'failed') ? 'failed' : 'success';

    console.log(`\n✅ [REAL WORK COMPLETE] Execution time: ${executionTime.toFixed(2)}s`);
    console.log(`   Tasks completed: ${results.execution_stats.tasks_completed}`);
    console.log(`   Files created: ${results.execution_stats.files_created}`);

    return {
      success: outcome === 'success',
      summary: `Successfully completed ${results.execution_stats.tasks_completed} objectives, created ${results.execution_stats.files_created} files`,
      results,
      errors
    };
  } catch (error) {
    console.error('Real work execution failed:', error);
    return {
      success: false,
      summary: 'Real work execution failed',
      results,
      errors: {
        fatal_error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

/**
 * Complete mission with results and tracking
 */
export async function completeMissionExecution(
  missionId: string,
  execution: {
    success: boolean;
    summary: string;
    results: Record<string, any>;
    errors: Record<string, any>;
  },
  executionTime: number,
  cost: number = 0
): Promise<boolean> {
  try {
    const revenue = execution.results.execution_stats?.tasks_completed || 0 * 100; // Example: $100 per task

    // Record mission result
    await missionResults.completeMission(missionId, {
      mission_id: missionId,
      summary: execution.summary,
      outcome: execution.success ? 'success' : 'partial',
      execution_time_seconds: executionTime,
      cost_usd: cost,
      revenue_usd: revenue,
      results: execution.results,
      errors: execution.errors
    });

    // Record revenue metric
    if (revenue > 0) {
      await missionResults.recordMetric(missionId, {
        revenue_category: 'task_completion',
        amount_usd: revenue,
        description: `Revenue from ${execution.results.execution_stats?.tasks_completed || 0} completed tasks`
      });
    }

    console.log(`💰 Mission completed. Revenue tracked: $${revenue}`);
    return true;
  } catch (error) {
    console.error('Failed to complete mission execution:', error);
    return false;
  }
}

/**
 * Full mission execution flow with real work
 */
export async function fullMissionExecution(mission: Mission): Promise<any> {
  const startTime = Date.now();
  const context: ExecutionContext = {
    mission,
    startTime,
    filesCreated: [],
    commitsGenerated: [],
    prsCreated: [],
    revenue: 0
  };

  try {
    // Log start
    await missionResults.logMissionEvent(
      mission.id,
      'agent_action',
      `Starting autonomous execution for mission: ${mission.title}`
    );

    // Execute real work
    const execution = await executeRealWork(context);
    const executionTime = (Date.now() - startTime) / 1000;

    // Complete mission and record results
    await completeMissionExecution(mission.id, execution, executionTime);

    // Log completion
    await missionResults.logMissionEvent(
      mission.id,
      'completed',
      `Mission completed. ${execution.summary}`
    );

    return {
      status: 'completed',
      mission_id: mission.id,
      execution_time_seconds: executionTime,
      success: execution.success,
      summary: execution.summary,
      tasks_executed: execution.results.tasks_executed?.length || 0,
      files_created: execution.results.files_created?.length || 0
    };
  } catch (error) {
    console.error('Mission execution failed:', error);

    // Log failure
    await missionResults.failMission(
      mission.id,
      `Execution failed: ${error instanceof Error ? error.message : String(error)}`,
      { stack: error instanceof Error ? error.stack : undefined }
    );

    return {
      status: 'failed',
      mission_id: mission.id,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
