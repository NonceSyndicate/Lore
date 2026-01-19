#!/usr/bin/env node
// Bootstrap script: Seed initial tasks to activate agents
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// First, create a sample mission
const sampleMission = {
  id: randomUUID(),
  title: 'Initial System Setup and Validation',
  description: 'Comprehensive system setup with health checks and documentation updates',
  priority: 'critical',
  status: 'pending',
  assigned_to: 'signer',
  context: {
    objectives: ['Verify infrastructure', 'Update documentation', 'Validate all agents'],
    tools_available: ['health_check', 'documentation_update', 'code_audit'],
    budget_limit_usd: 50,
    autonomous: true,
  },
};

const initialTasks = [
  {
    id: randomUUID(),
    mission_id: sampleMission.id,
    title: 'Verify Infrastructure Health',
    description: 'Verify all infrastructure components are operational',
    agent_type: 'operator',
    status: 'pending',
    priority: 'critical',
    context: {
      services: ['Supabase', 'GitHub', 'Inngest'],
    },
  },
  {
    id: randomUUID(),
    mission_id: sampleMission.id,
    title: 'Update Project Documentation',
    description: 'Update README.md with current project status and deployment instructions',
    agent_type: 'scribe',
    status: 'pending',
    priority: 'high',
    context: {
      target: 'README.md',
      sections: ['Quick Start', 'Architecture', 'Deployment'],
    },
  },
  {
    id: randomUUID(),
    mission_id: sampleMission.id,
    title: 'Market Opportunity Analysis',
    description: 'Analyze current opportunities in code audit services market',
    agent_type: 'researcher',
    status: 'pending',
    priority: 'medium',
    context: {
      focus: 'code audit services',
      target_market: 'Web3/DeFi projects',
      budget: 'micro-SMB',
    },
  },
];

async function seedTasks() {
  console.log('🌱 Seeding initial mission and tasks...');
  
  // Create mission first
  const { data: missionData, error: missionError } = await supabase
    .from('missions')
    .insert([sampleMission]);
  
  if (missionError) {
    console.error('❌ Error seeding mission:', missionError);
    process.exit(1);
  }
  
  // Then create tasks
  const { data, error } = await supabase
    .from('tasks')
    .insert(initialTasks);
  
  if (error) {
    console.error('❌ Error seeding tasks:', error);
    process.exit(1);
  }
  
  console.log(`✓ Successfully seeded mission and ${initialTasks.length} tasks`);
  console.log('\n📋 Mission created:');
  console.log(`   ${sampleMission.title} [${sampleMission.priority}]`);
  console.log('\n📋 Tasks created:');
  initialTasks.forEach((task, i) => {
    console.log(`${i + 1}. [${task.agent_type.toUpperCase()}] ${task.title} (${task.priority})`);
  });
  
  console.log('\n⚡ Agents are now ready to be activated!');
  console.log('   Next: Run the agent coordinator or wait for cron trigger');
}

seedTasks();
