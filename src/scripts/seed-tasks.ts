#!/usr/bin/env node
// Bootstrap script: Seed initial tasks to activate agents
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const initialTasks = [
  {
    id: randomUUID(),
    agent_type: 'SCRIBE',
    task_type: 'document_update',
    description: 'Update README.md with current project status and deployment instructions',
    status: 'pending',
    priority: 5,
    input_data: {
      target: 'README.md',
      sections: ['Quick Start', 'Architecture', 'Deployment'],
    },
  },
  {
    id: randomUUID(),
    agent_type: 'RESEARCHER',
    task_type: 'market_analysis',
    description: 'Analyze current opportunities in code audit services market',
    status: 'pending',
    priority: 8,
    input_data: {
      focus: 'code audit services',
      target_market: 'Web3/DeFi projects',
      budget: 'micro-SMB',
    },
  },
  {
    id: randomUUID(),
    agent_type: 'AUDITOR',
    task_type: 'repository_scan',
    description: 'Audit current codebase for security issues and code quality',
    status: 'pending',
    priority: 7,
    input_data: {
      repository: 'NonceSyndicate/Lore',
      scope: ['src/inngest', 'package.json', 'tsconfig.json'],
    },
  },
  {
    id: randomUUID(),
    agent_type: 'OPERATOR',
    task_type: 'health_check',
    description: 'Verify all infrastructure components are operational',
    status: 'pending',
    priority: 9,
    input_data: {
      services: ['Supabase', 'GitHub', 'Inngest'],
    },
  },
  {
    id: randomUUID(),
    agent_type: 'NEGOTIATOR',
    task_type: 'service_research',
    description: 'Research potential first client - identify Web3 projects needing audits',
    status: 'pending',
    priority: 6,
    input_data: {
      criteria: 'Recently funded, under 10M valuation, active development',
    },
  },
];

async function seedTasks() {
  console.log('🌱 Seeding initial tasks...');
  
  const { data, error } = await supabase
    .from('agent_tasks')
    .insert(initialTasks);
  
  if (error) {
    console.error('❌ Error seeding tasks:', error);
    process.exit(1);
  }
  
  console.log(`✓ Successfully seeded ${initialTasks.length} tasks`);
  console.log('\n📋 Tasks created:');
  initialTasks.forEach((task, i) => {
    console.log(`${i + 1}. [${task.agent_type}] ${task.description} (Priority: ${task.priority})`);
  });
  
  console.log('\n⚡ Agents are now ready to be activated!');
  console.log('   Next: Run the agent coordinator or wait for cron trigger');
}

seedTasks();
