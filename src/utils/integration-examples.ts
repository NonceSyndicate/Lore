/**
 * Example Integration - How to Use the Autonomous Agent System
 * 
 * This file demonstrates how to integrate all the components
 * together for a complete autonomous mission execution workflow.
 */

import { supabase } from '@/src/inngest/client';
import { fullMissionExecution } from '@/src/utils/enhanced-execution';
import {
  completeMission,
  getMissionStats,
  getAgentPerformance,
  getMissionAuditTrail,
  generateMissionReport
} from '@/src/utils/mission-results';

// ============================================
// EXAMPLE 1: Create and Execute a Mission
// ============================================

async function exampleCreateAndExecuteMission() {
  console.log('='.repeat(60));
  console.log('EXAMPLE 1: Create and Execute a Mission');
  console.log('='.repeat(60));

  // Create a mission
  const missionData = {
    title: 'Build TypeScript Utilities Library',
    description: 'Generate a complete utilities library with tests and docs',
    priority: 'high',
    status: 'pending',
    context: {
      objectives: [
        'Create array utility functions',
        'Create string utility functions',
        'Create type definitions',
        'Add unit tests',
        'Generate JSDoc documentation'
      ],
      tools_available: ['GitHub', 'AI Models', 'TypeScript', 'Jest'],
      budget_limit_usd: 15,
      autonomous: true
    },
    assigned_to: 'operator',
    created_at: new Date().toISOString()
  };

  console.log('📝 Creating mission...');
  const { data: mission, error } = await supabase
    .from('missions')
    .insert([missionData])
    .select()
    .single();

  if (error || !mission) {
    console.error('❌ Failed to create mission:', error);
    return;
  }

  console.log(`✅ Mission created: ${mission.id}`);
  console.log(`   Title: ${mission.title}`);
  console.log(`   Objectives: ${mission.context.objectives.length}`);

  // Execute the mission
  console.log('\n🚀 Executing mission...');
  const result = await fullMissionExecution(mission);

  console.log(`\n${result.success ? '✅' : '❌'} Execution ${result.success ? 'succeeded' : 'failed'}`);
  console.log(`   Summary: ${result.summary}`);
  console.log(`   Tasks Executed: ${result.tasks_executed}`);
  console.log(`   Files Created: ${result.files_created}`);
  console.log(`   Time: ${result.execution_time_seconds?.toFixed(2)}s`);

  return mission.id;
}

// ============================================
// EXAMPLE 2: Track Mission Progress
// ============================================

async function exampleTrackMissionProgress(missionId: string) {
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 2: Track Mission Progress');
  console.log('='.repeat(60));

  // Get mission stats
  console.log('📊 Fetching mission statistics...');
  const stats = await getMissionStats(missionId);

  if (stats) {
    console.log(`✅ Mission Status: ${stats.status}`);
    console.log(`   Priority: ${stats.priority}`);
    console.log(`   Outcome: ${stats.outcome}`);
    console.log(`   Execution Time: ${stats.execution_time}s`);
    console.log(`   Cost: $${stats.cost_usd}`);
    console.log(`   Revenue: $${stats.revenue_usd}`);
    console.log(`   Deliverables: ${stats.deliverables}`);
    console.log(`   GitHub Commits: ${stats.github_commits}`);
    console.log(`   Pull Requests: ${stats.github_prs}`);
  } else {
    console.log('❌ Could not fetch mission stats');
  }
}

// ============================================
// EXAMPLE 3: Check Agent Performance
// ============================================

async function exampleCheckAgentPerformance() {
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 3: Check Agent Performance');
  console.log('='.repeat(60));

  // Get performance for all agents
  console.log('📈 Fetching agent performance metrics...\n');
  const agents = ['operator', 'researcher', 'scribe', 'signer'];

  for (const agent of agents) {
    const performance = await getAgentPerformance(agent);

    if (performance.length > 0) {
      const p = performance[0];
      console.log(`🤖 ${agent.toUpperCase()}`);
      console.log(`   Total Missions: ${p.total_missions}`);
      console.log(`   Completed: ${p.completed}`);
      console.log(`   Failed: ${p.failed}`);
      console.log(`   Success Rate: ${p.success_rate}%`);
      console.log(`   Avg Time: ${p.avg_execution_time_seconds?.toFixed(2)}s`);
      console.log(`   Total Revenue: $${p.total_revenue_usd}`);
      console.log(`   Commits: ${p.total_commits}`);
      console.log(`   PRs: ${p.total_prs}\n`);
    }
  }
}

// ============================================
// EXAMPLE 4: View Mission Audit Trail
// ============================================

async function exampleViewAuditTrail(missionId: string) {
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 4: View Mission Audit Trail');
  console.log('='.repeat(60));

  const trail = await getMissionAuditTrail(missionId);

  console.log(`📜 Audit Trail (${trail.length} events):\n`);

  trail.forEach((event, index) => {
    const time = new Date(event.created_at).toLocaleString();
    console.log(`${index + 1}. [${time}]`);
    console.log(`   Event: ${event.event_type}`);
    console.log(`   Agent: ${event.agent_name}`);
    console.log(`   Description: ${event.description}\n`);
  });
}

// ============================================
// EXAMPLE 5: Generate Comprehensive Report
// ============================================

async function exampleGenerateReport(missionId: string) {
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 5: Generate Comprehensive Report');
  console.log('='.repeat(60));

  const report = await generateMissionReport(missionId);

  if (!report) {
    console.log('❌ Could not generate report');
    return;
  }

  console.log('\n📋 MISSION REPORT');
  console.log('='.repeat(60));
  console.log(`Mission: ${report.mission?.title}`);
  console.log(`Status: ${report.mission?.status}`);
  console.log(`Agent: ${report.mission?.assigned_to}`);
  console.log(`Priority: ${report.mission?.priority}`);

  console.log('\n📦 DELIVERABLES');
  console.log(`Total: ${report.deliverables.length}`);
  report.deliverables.forEach(d => {
    console.log(`  - ${d.name} (${d.type}): ${d.description}`);
    if (d.github_url) console.log(`    ${d.github_url}`);
  });

  console.log('\n🔗 GITHUB ACTIVITY');
  console.log(`Commits: ${report.github.totalCommits}`);
  console.log(`PRs: ${report.github.totalPRs}`);
  console.log(`Additions: +${report.github.totalAdditions}`);
  console.log(`Deletions: -${report.github.totalDeletions}`);

  console.log('\n💰 FINANCIAL');
  console.log(`Total Revenue: $${report.revenue}`);
  console.log(`Cost: $${report.mission?.cost_usd || 0}`);
  console.log(`Net: $${report.revenue - (report.mission?.cost_usd || 0)}`);

  console.log('\n⏱️  TIMING');
  console.log(`Created: ${new Date(report.mission?.created_at).toLocaleString()}`);
  if (report.mission?.started_at) {
    console.log(`Started: ${new Date(report.mission.started_at).toLocaleString()}`);
  }
  if (report.mission?.completed_at) {
    console.log(`Completed: ${new Date(report.mission.completed_at).toLocaleString()}`);
  }

  console.log('\n✅ Report generated at:', report.generatedAt);
  console.log('='.repeat(60));
}

// ============================================
// EXAMPLE 6: API Usage Examples
// ============================================

async function exampleAPIUsage() {
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 6: API Usage Examples');
  console.log('='.repeat(60));

  // Example 1: Create mission via API
  console.log('\n1️⃣  CREATE MISSION VIA API');
  console.log(`
curl -X POST http://localhost:3000/api/missions \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Generate API Documentation",
    "description": "Create OpenAPI spec and docs",
    "priority": "high",
    "assigned_to": "scribe",
    "context": {
      "objectives": [
        "Generate OpenAPI specification",
        "Create API documentation",
        "Create usage examples"
      ],
      "tools_available": ["GitHub", "AI Models"],
      "budget_limit_usd": 10,
      "autonomous": true
    }
  }'
  `);

  // Example 2: Get missions via API
  console.log('\n2️⃣  GET MISSIONS VIA API');
  console.log(`
curl http://localhost:3000/api/missions?status=completed&limit=10
curl http://localhost:3000/api/missions?assigned_to=operator
curl http://localhost:3000/api/missions?status=in_progress
  `);

  // Example 3: Get mission report via API
  console.log('\n3️⃣  GET MISSION REPORT VIA API');
  console.log(`
curl http://localhost:3000/api/missions/{mission-id}/report
  `);

  // Example 4: Export report via API
  console.log('\n4️⃣  EXPORT REPORT VIA API');
  console.log(`
curl -X POST http://localhost:3000/api/missions/{mission-id}/report \\
  -H "Content-Type: application/json" \\
  -d '{"format": "json"}'
  `);
}

// ============================================
// EXAMPLE 7: Dashboard Monitoring
// ============================================

async function exampleDashboardMonitoring() {
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 7: Dashboard Monitoring');
  console.log('='.repeat(60));

  console.log(`
The dashboard at http://localhost:3000/dashboard provides:

📊 REAL-TIME STATISTICS
- Total missions, completed, failed
- Total revenue generated
- GitHub commits and PRs
- Live activity log

🤖 AGENT PERFORMANCE
- Success rates by agent
- Average execution time
- Total revenue per agent
- GitHub activity per agent

📋 RECENT MISSIONS TABLE
- Mission titles and status
- Agent assignment
- Revenue earned
- GitHub commits

🔄 LIVE ACTIVITY LOG
- Real-time log entries
- Error tracking
- Agent actions
- System events

All updates happen in real-time using Supabase subscriptions!
  `);
}

// ============================================
// MAIN: Run All Examples
// ============================================

async function runAllExamples() {
  try {
    console.log('🚀 AUTONOMOUS AGENT SYSTEM - INTEGRATION EXAMPLES\n');

    // Example 1: Create and execute mission
    const missionId = await exampleCreateAndExecuteMission();

    if (missionId) {
      // Wait a bit for execution to start
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Example 2: Track progress
      await exampleTrackMissionProgress(missionId);

      // Example 3: Check agent performance
      await exampleCheckAgentPerformance();

      // Example 4: View audit trail
      await exampleViewAuditTrail(missionId);

      // Example 5: Generate report
      await exampleGenerateReport(missionId);
    }

    // Example 6: Show API usage
    await exampleAPIUsage();

    // Example 7: Show dashboard
    await exampleDashboardMonitoring();

    console.log('\n✅ All examples completed!');
    console.log('\n📚 Next Steps:');
    console.log('  1. Visit http://localhost:3000/dashboard');
    console.log('  2. Create your own missions via API');
    console.log('  3. Monitor missions in real-time');
    console.log('  4. View detailed reports for each mission');
    console.log('  5. Check GitHub for created PRs and commits\n');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Export for use in other files
export {
  exampleCreateAndExecuteMission,
  exampleTrackMissionProgress,
  exampleCheckAgentPerformance,
  exampleViewAuditTrail,
  exampleGenerateReport,
  exampleAPIUsage,
  exampleDashboardMonitoring,
  runAllExamples
};

// Uncomment to run examples:
// runAllExamples().catch(console.error);
