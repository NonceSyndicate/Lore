/**
 * SCRIBE Agent - Documentation & Reporting
 * Generates markdown documentation, daily summaries, and formatted reports
 */

import { supabase } from '../inngest/client';

export interface DocumentationResult {
  timestamp: string;
  filename: string;
  content: string;
  format: 'markdown';
}

export interface DailySummaryResult {
  timestamp: string;
  date: string;
  summary: string;
  tasksCompleted: number;
  tasksStarted: number;
  tasksFailed: number;
  agentActivity: Record<string, { tasks: number; status: string }>;
}

async function documentUpdate(inputData: any): Promise<DocumentationResult> {
  const timestamp = new Date().toISOString();
  const title = inputData?.title || 'Agent System Documentation';
  const results = inputData?.results || {};

  let markdown = `# ${title}\n\n`;
  markdown += `**Generated:** ${timestamp}\n\n`;

  if (results.health_check) {
    markdown += `## System Health Status\n\n`;
    markdown += `- **Status:** ${results.health_check.status.toUpperCase()}\n`;
    markdown += `- **Database:** ${results.health_check.database.connected ? '✅ Connected' : '❌ Disconnected'}\n`;
    markdown += `- **Agents Total:** ${results.health_check.agents.total}\n`;
    markdown += `  - Idle: ${results.health_check.agents.idle}\n`;
    markdown += `  - Active: ${results.health_check.agents.active}\n`;
    markdown += `  - Busy: ${results.health_check.agents.busy}\n`;
    markdown += `- **Pending Tasks:** ${results.health_check.tasks.pending}\n`;
    markdown += `- **In Progress:** ${results.health_check.tasks.in_progress}\n`;
    markdown += `- **Completed:** ${results.health_check.tasks.completed}\n\n`;
  }

  if (results.market_analysis) {
    markdown += `## Market Analysis\n\n`;
    markdown += `**Segment:** ${results.market_analysis.marketSegment}\n`;
    markdown += `**Market Size:** ${results.market_analysis.marketSize}\n`;
    markdown += `**Growth Trend:** ${results.market_analysis.growthTrend}\n\n`;
    markdown += `### Opportunities\n`;
    results.market_analysis.opportunities.forEach((opp: string) => {
      markdown += `- ${opp}\n`;
    });
    markdown += `\n### Threats\n`;
    results.market_analysis.threats.forEach((threat: string) => {
      markdown += `- ${threat}\n`;
    });
    markdown += '\n';
  }

  if (results.github_analysis) {
    markdown += `## Repository Analysis: ${results.github_analysis.repository}\n\n`;
    markdown += `- **Stars:** ${results.github_analysis.metrics.stars}\n`;
    markdown += `- **Forks:** ${results.github_analysis.metrics.forks}\n`;
    markdown += `- **Open Issues:** ${results.github_analysis.metrics.openIssues}\n`;
    markdown += `- **Last Update:** ${results.github_analysis.activity.lastUpdate}\n`;
    markdown += `- **Maturity:** ${results.github_analysis.insights.maturity}\n`;
    markdown += `- **Maintenance:** ${results.github_analysis.insights.maintenance}\n\n`;
  }

  return {
    timestamp,
    filename: `documentation-${new Date().toISOString().split('T')[0]}.md`,
    content: markdown,
    format: 'markdown',
  };
}

async function logSummary(inputData: any): Promise<DailySummaryResult> {
  const timestamp = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];

  try {
    // Fetch today's tasks
    const { data: tasks, error } = await supabase
      .from('agent_tasks')
      .select('status, agent_type, created_at, completed_at')
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`);

    if (error || !tasks) {
      return {
        timestamp,
        date: today,
        summary: 'Error generating daily summary',
        tasksCompleted: 0,
        tasksStarted: 0,
        tasksFailed: 0,
        agentActivity: {},
      };
    }

    const completed = tasks.filter((t: any) => t.status === 'completed').length;
    const started = tasks.filter((t: any) => t.status === 'in_progress' || t.status === 'pending').length;
    const failed = tasks.filter((t: any) => t.status === 'failed').length;

    // Group by agent type
    const agentActivity: Record<string, any> = {};
    tasks.forEach((t: any) => {
      if (!agentActivity[t.agent_type]) {
        agentActivity[t.agent_type] = { tasks: 0, status: 'idle' };
      }
      agentActivity[t.agent_type].tasks++;
      if (t.status === 'in_progress') {
        agentActivity[t.agent_type].status = 'active';
      }
    });

    const summary = `## Daily Summary - ${today}

- **Tasks Completed:** ${completed}
- **Tasks In Progress:** ${started}
- **Tasks Failed:** ${failed}
- **Total Tasks:** ${tasks.length}

### Agent Activity
${Object.entries(agentActivity)
  .map(([agent, data]: [string, any]) => `- **${agent}:** ${data.tasks} tasks (${data.status})`)
  .join('\n')}
`;

    return {
      timestamp,
      date: today,
      summary,
      tasksCompleted: completed,
      tasksStarted: started,
      tasksFailed: failed,
      agentActivity,
    };
  } catch (error) {
    return {
      timestamp,
      date: today,
      summary: 'Error generating daily summary',
      tasksCompleted: 0,
      tasksStarted: 0,
      tasksFailed: 0,
      agentActivity: {},
    };
  }
}

export async function execute(taskType: string, inputData: any): Promise<any> {
  console.log(`[SCRIBE] Executing task: ${taskType}`);

  switch (taskType) {
    case 'document_update':
      return await documentUpdate(inputData);
    case 'log_summary':
      return await logSummary(inputData);
    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
}
