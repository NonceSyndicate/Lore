/**
 * Seed Script for Mission System
 * Populates test missions for autonomous agent execution
 * 
 * Usage: npx ts-node src/scripts/seed-missions.ts
 */

import { createClient } from '@supabase/supabase-js';
import { Mission, MissionContext } from '../types/missions';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testMissions: Omit<Mission, 'id' | 'created_at'>[] = [
  {
    title: 'System Health Audit',
    description: 'Comprehensive review of all agent systems, task queues, and error rates',
    priority: 'high',
    status: 'pending',
    assigned_to: 'signer',
    context: {
      objectives: [
        'Check Inngest function health status',
        'Review error logs from last 24 hours',
        'Verify Supabase connection and database health',
        'Monitor API response times',
        'Generate health report',
      ],
      tools_available: [
        'Inngest Dashboard',
        'Supabase Logs',
        'Vercel Analytics',
        'Custom Health Check API',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['infrastructure', 'monitoring', 'weekly'],
    metadata: {
      category: 'operations',
      frequency: 'daily',
      criticality: 'high',
    },
  },

  {
    title: 'Revenue Opportunity Scan',
    description: 'Identify and analyze potential revenue opportunities in crypto markets',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'researcher',
    context: {
      objectives: [
        'Scan major DEX pools for inefficiencies',
        'Identify arbitrage opportunities',
        'Analyze new token launches',
        'Check DeFi protocol yields',
        'Compile opportunity report',
      ],
      tools_available: [
        'Dune Analytics',
        'CoinGecko API',
        'DEX Aggregators',
        'Blockchain Explorers',
      ],
      budget_limit_usd: 10,
      autonomous: true,
    },
    tags: ['revenue', 'market-analysis', 'daily'],
    metadata: {
      category: 'revenue',
      min_opportunity_size_usd: 100,
      markets: ['ethereum', 'polygon', 'arbitrum'],
    },
  },

  {
    title: 'Documentation Update - Daily Report',
    description: 'Generate and update daily operational log and status report',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Summarize missions completed',
        'Document any issues encountered',
        'Update agent performance metrics',
        'Create daily log entry',
        'Post status update to communications channel',
      ],
      tools_available: [
        'Supabase Database',
        'GitHub Pages',
        'Document Editor',
        'X/Twitter API',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['documentation', 'daily', 'reporting'],
    metadata: {
      category: 'documentation',
      publish_location: 'logs/day-XX.md',
    },
  },

  {
    title: 'Infrastructure Monitoring - Critical',
    description: 'Real-time monitoring of all critical infrastructure components',
    priority: 'critical',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Check Vercel deployment health',
        'Monitor Inngest queue status',
        'Verify database connections',
        'Check API endpoint availability',
        'Alert on any anomalies',
      ],
      tools_available: [
        'Vercel Dashboard',
        'Inngest Monitoring',
        'Supabase Monitoring',
        'UptimeRobot',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['infrastructure', 'critical', 'monitoring'],
    metadata: {
      category: 'critical',
      sla_response_time_ms: 5000,
      escalation: true,
    },
  },

  {
    title: 'Deploy New Agent Function',
    description: 'Deploy latest researcher agent with enhanced analysis capabilities',
    priority: 'high',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Build new function version',
        'Run full test suite',
        'Execute blue-green deployment',
        'Verify functionality with canary traffic',
        'Complete deployment or rollback',
      ],
      tools_available: [
        'GitHub Actions',
        'Vercel CLI',
        'Inngest Dashboard',
        'Feature Flags',
      ],
      budget_limit_usd: 5,
      autonomous: false,
    },
    tags: ['deployment', 'infrastructure', 'features'],
    metadata: {
      category: 'deployment',
      requires_approval: true,
      rollback_procedure: 'auto',
    },
  },

  {
    title: 'Weekly Performance Review',
    description: 'Comprehensive analysis of agent performance metrics for the week',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'researcher',
    context: {
      objectives: [
        'Analyze task completion rates',
        'Review mission success metrics',
        'Identify performance bottlenecks',
        'Compare against baseline metrics',
        'Generate recommendations',
      ],
      tools_available: [
        'Supabase Analytics',
        'Custom Analytics Dashboard',
        'Grafana',
        'DataDog',
      ],
      budget_limit_usd: 2,
      autonomous: true,
    },
    tags: ['analytics', 'performance', 'weekly'],
    metadata: {
      category: 'reporting',
      metrics_to_track: [
        'task_completion_rate',
        'average_execution_time',
        'error_rate',
        'cost_efficiency',
      ],
    },
  },

  {
    title: 'Test Mission - Quick Execute',
    description: 'Simple test mission to verify orchestration system is working',
    priority: 'low',
    status: 'pending',
    assigned_to: 'signer',
    context: {
      objectives: [
        'Execute simple task',
        'Log results',
        'Verify mission completion flow',
      ],
      tools_available: [
        'Console',
        'Supabase API',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['test', 'quick'],
    metadata: {
      category: 'test',
      expected_duration_seconds: 30,
    },
  },

  {
    title: 'Community Engagement - Social Media',
    description: 'Post updates and engage with community on social platforms',
    priority: 'low',
    status: 'pending',
    assigned_to: 'scribe',
    context: {
      objectives: [
        'Check community comments and questions',
        'Respond to important questions',
        'Post progress updates',
        'Share notable achievements',
        'Engage with relevant discussions',
      ],
      tools_available: [
        'X/Twitter API',
        'Discord API',
        'GitHub Discussions',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['community', 'marketing', 'daily'],
    metadata: {
      category: 'marketing',
      platforms: ['twitter', 'discord', 'github'],
      tone: 'professional',
    },
  },

  {
    title: 'Code Quality Review - Signer Orchestrator',
    description: 'Review and improve code quality of signer orchestrator function',
    priority: 'medium',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Run linter and type checker',
        'Review code for improvements',
        'Check for security issues',
        'Update documentation',
        'Create pull request if needed',
      ],
      tools_available: [
        'TypeScript',
        'ESLint',
        'GitHub Actions',
        'Code Review Tools',
      ],
      budget_limit_usd: 0,
      autonomous: true,
    },
    tags: ['code-quality', 'technical-debt'],
    metadata: {
      category: 'development',
      target_files: [
        'src/inngest/functions/signer-orchestrator.ts',
      ],
    },
  },

  {
    title: 'Database Optimization - Query Performance',
    description: 'Analyze and optimize slow database queries',
    priority: 'high',
    status: 'pending',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Identify slow queries',
        'Analyze query plans',
        'Add missing indices',
        'Test performance improvements',
        'Document changes',
      ],
      tools_available: [
        'Supabase Query Inspector',
        'PostgreSQL EXPLAIN',
        'Performance Monitoring',
      ],
      budget_limit_usd: 1,
      autonomous: true,
    },
    tags: ['database', 'performance', 'optimization'],
    metadata: {
      category: 'infrastructure',
      max_query_time_ms: 1000,
    },
  },
];

async function seedMissions() {
  console.log('🌱 Starting mission seeding...\n');

  try {
    // Clear existing missions (optional)
    console.log('📋 Checking existing missions...');
    const { count: existingCount } = await supabase
      .from('missions')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', 'seed');

    if (existingCount && existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing seeded missions. Skipping re-seed.\n`);
      console.log('💡 To re-seed, run: DELETE FROM missions WHERE created_by = "seed";\n');
      return;
    }

    // Insert missions
    console.log(`📨 Inserting ${testMissions.length} test missions...\n`);

    const missionsWithMetadata = testMissions.map(mission => ({
      ...mission,
      created_by: 'seed',
    }));

    const { data: inserted, error } = await supabase
      .from('missions')
      .insert(missionsWithMetadata)
      .select();

    if (error) {
      console.error('❌ Error inserting missions:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully inserted ${inserted?.length || 0} missions:\n`);

    // Display summary
    inserted?.forEach((mission, index) => {
      console.log(`${index + 1}. 🎯 ${mission.title}`);
      console.log(`   Priority: ${mission.priority.toUpperCase()}`);
      console.log(`   Assigned to: ${mission.assigned_to}`);
      console.log(`   Objectives: ${mission.context.objectives.length}`);
      console.log(`   ID: ${mission.id}\n`);
    });

    // Display statistics
    const byPriority = inserted?.reduce((acc: any, m) => {
      acc[m.priority] = (acc[m.priority] || 0) + 1;
      return acc;
    }, {});

    const byAgent = inserted?.reduce((acc: any, m) => {
      acc[m.assigned_to] = (acc[m.assigned_to] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Mission Distribution:');
    console.log(`   By Priority: ${JSON.stringify(byPriority)}`);
    console.log(`   By Agent: ${JSON.stringify(byAgent)}\n`);

    console.log('✨ Seeding complete!\n');
    console.log('📖 Next steps:');
    console.log('   1. Check missions in Supabase dashboard');
    console.log('   2. Monitor signer-orchestrator execution');
    console.log('   3. View mission progress in logs');
    console.log('   4. Query mission_summary view for dashboard\n');

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run seeding
seedMissions();
