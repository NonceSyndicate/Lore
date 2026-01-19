/**
 * RESEARCHER Agent - Market & Code Analysis
 * Analyzes Web3 markets, competitor landscapes, and GitHub repositories using AI
 */

import { supabase } from '../inngest/client';
import { callAI, formatMissionPrompt } from '../utils/ai-provider';

export interface MarketAnalysis {
  timestamp: string;
  marketSegment: string;
  competitors: {
    name: string;
    focus: string;
    strengths: string[];
    weaknesses: string[];
  }[];
  opportunities: string[];
  threats: string[];
  marketSize: string;
  growthTrend: string;
}

export interface GitHubAnalysis {
  timestamp: string;
  repository: string;
  metrics: {
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
  };
  activity: {
    recentCommits: number;
    commitFrequency: string;
    lastUpdate: string;
    contributors: number;
  };
  insights: {
    maturity: 'experimental' | 'beta' | 'stable' | 'mature';
    maintenance: 'active' | 'inactive' | 'dormant';
    quality: 'high' | 'medium' | 'low';
  };
  recommendations: string[];
}

export interface ResearcherExecutionResult {
  success: boolean;
  missionId: string;
  action: string;
  aiOutput: string;
  executionDetails: Record<string, any>;
  timestamp: string;
}

async function marketAnalysis(inputData: any): Promise<MarketAnalysis> {
  // Placeholder market analysis data for code audit services in Web3
  return {
    timestamp: new Date().toISOString(),
    marketSegment: 'Web3 Security & Automation',
    competitors: [
      {
        name: 'OpenZeppelin',
        focus: 'Smart contract auditing and security tools',
        strengths: ['Industry reputation', 'Comprehensive tooling', 'Large community'],
        weaknesses: ['High costs', 'Limited automation', 'Slow turnaround'],
      },
      {
        name: 'Trail of Bits',
        focus: 'Security research and contract audits',
        strengths: ['Deep expertise', 'Thorough analysis', 'Research publications'],
        weaknesses: ['Premium pricing', 'Small team capacity', 'Limited accessibility'],
      },
      {
        name: 'Hacken',
        focus: 'Bug bounties and security reviews',
        strengths: ['Fast audits', 'Community engagement', 'Competitive pricing'],
        weaknesses: ['Variable quality', 'Limited specialization', 'Inconsistent reporting'],
      },
    ],
    opportunities: [
      'Nonce validation as specialized service',
      'Automation-focused audit packages',
      'Real-time monitoring and alerts',
      'Open-source tooling for developers',
      'Educational content and workshops',
    ],
    threats: [
      'Established competitors with brand recognition',
      'In-house auditing teams at major protocols',
      'Economic downturn reducing audit demand',
      'Regulatory changes in crypto industry',
    ],
    marketSize: '$500M - $1B annually (estimated)',
    growthTrend: 'Growing 40-60% YoY despite market cycles',
  };
}

async function githubAnalysis(inputData: any): Promise<GitHubAnalysis> {
  const repoName = inputData?.repository || 'unknown/repo';
  
  // Placeholder GitHub analysis - in production this would use GitHub API
  return {
    timestamp: new Date().toISOString(),
    repository: repoName,
    metrics: {
      stars: 2450,
      forks: 180,
      openIssues: 42,
      watchers: 89,
    },
    activity: {
      recentCommits: 34,
      commitFrequency: 'Multiple commits per day',
      lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      contributors: 12,
    },
    insights: {
      maturity: 'stable',
      maintenance: 'active',
      quality: 'high',
    },
    recommendations: [
      'Repository is actively maintained',
      'Good community engagement based on issues/PRs',
      'Regular updates and stable releases',
      'Consider contributing to active projects',
      'Monitor for security advisories',
    ],
  };
}

export async function execute(taskType: string, inputData: any): Promise<any> {
  console.log(`[RESEARCHER] Executing task: ${taskType}`);

  switch (taskType) {
    case 'market_analysis':
      return await marketAnalysis(inputData);
    case 'github_analysis':
      return await githubAnalysis(inputData);
    case 'mission_execution':
      return await executeMission(inputData);
    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
}

/**
 * Execute a research mission using AI analysis
 */
async function executeMission(mission: any): Promise<ResearcherExecutionResult> {
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`[RESEARCHER] Starting mission execution: ${mission.id}`);

    // Generate AI prompt from mission context
    const missionPrompt = formatMissionPrompt(mission);
    
    // Get AI research guidance
    const systemPrompt = `You are an expert Researcher agent specializing in Web3 market analysis, competitive intelligence, and technical research.
Your role is to:
1. Analyze market opportunities and threats
2. Identify key competitors and their positioning
3. Provide actionable intelligence and insights
4. Research technical specifications and comparisons
5. Forecast trends and market dynamics

Be analytical, data-driven, and provide specific examples and sources when possible.`;

    const aiResponse = await callAI(
      missionPrompt,
      systemPrompt,
      []
    );

    console.log(`[RESEARCHER] AI Response (${aiResponse.provider}):`, aiResponse.content.substring(0, 200));

    // Extract key findings from AI output
    const findings = extractFindings(aiResponse.content);

    // Log research results to Supabase
    if (supabase) {
      await supabase
        .from('mission_results')
        .insert({
          mission_id: mission.id,
          agent_type: 'researcher',
          research_findings: aiResponse.content,
          key_insights: findings,
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
        findings,
        priority: mission.priority,
        objectives: mission.context?.objectives || [],
      },
      timestamp,
    };
  } catch (error) {
    console.error('[RESEARCHER] Mission execution failed:', error);
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
 * Extract key findings from research output
 */
function extractFindings(researchOutput: string): string[] {
  const lines = researchOutput.split('\n');
  const findings: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^[\d\-*•]/)) {
      const cleaned = trimmed.replace(/^[\d\-*•]\s*/, '').trim();
      if (cleaned.length > 10) {
        findings.push(cleaned);
      }
    }
  }
  
  return findings.length > 0 ? findings : [researchOutput.substring(0, 250)];
}
