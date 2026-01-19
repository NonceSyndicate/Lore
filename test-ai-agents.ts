/**
 * Test AI Agent Integration
 * Verifies that agents can execute missions with AI
 */

import { callAI, formatMissionPrompt } from './src/utils/ai-provider';
import * as operatorAgent from './src/agents/operator';
import * as researcherAgent from './src/agents/researcher';
import * as scribeAgent from './src/agents/scribe';

const testMission = {
  id: 'test-mission-001',
  title: 'Test Mission - Content Generation',
  description: 'Generate comprehensive marketing content',
  priority: 'high',
  status: 'pending',
  assigned_to: 'scribe',
  context: {
    objectives: [
      'Create Twitter announcement thread',
      'Generate landing page copy',
      'Write technical blog post intro'
    ],
    tools_available: ['AI', 'Markdown', 'Social Media APIs'],
    budget_limit_usd: 50,
    autonomous: true
  },
  created_at: new Date().toISOString()
};

async function runTests() {
  console.log('\n🧪 AI AGENT INTEGRATION TEST SUITE\n');
  console.log('=' .repeat(80));

  // Test 1: AI Provider Direct Call
  console.log('\n📌 Test 1: Direct AI Provider Call');
  console.log('-'.repeat(80));
  try {
    const response = await callAI(
      'Generate a catchy 3-line pitch for an autonomous agent system',
      'You are a marketing expert. Be concise and creative.',
      []
    );
    console.log(`✅ AI Response (${response.provider}): ${response.content.substring(0, 100)}...`);
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  // Test 2: Mission Prompt Formatting
  console.log('\n📌 Test 2: Mission Prompt Formatting');
  console.log('-'.repeat(80));
  try {
    const prompt = formatMissionPrompt(testMission);
    console.log('✅ Prompt generated:', prompt.substring(0, 150) + '...');
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  // Test 3: Scribe Agent Mission Execution
  console.log('\n📌 Test 3: Scribe Agent Mission Execution');
  console.log('-'.repeat(80));
  try {
    const result = await scribeAgent.execute('mission_execution', testMission);
    if (result.success) {
      console.log(`✅ Scribe execution successful`);
      console.log(`   Provider: ${result.executionDetails.provider}`);
      console.log(`   Content length: ${result.aiOutput.length} chars`);
    } else {
      console.log(`⚠️  Scribe execution incomplete: ${result.aiOutput}`);
    }
  } catch (error) {
    console.error('❌ Test 3 failed:', error);
  }

  // Test 4: Researcher Agent Mission Execution
  console.log('\n📌 Test 4: Researcher Agent Mission Execution');
  console.log('-'.repeat(80));
  const researchMission = { ...testMission, assigned_to: 'researcher', id: 'test-research-001' };
  try {
    const result = await researcherAgent.execute('mission_execution', researchMission);
    if (result.success) {
      console.log(`✅ Researcher execution successful`);
      console.log(`   Provider: ${result.executionDetails.provider}`);
      console.log(`   Findings count: ${result.executionDetails.findings?.length || 0}`);
    } else {
      console.log(`⚠️  Researcher execution incomplete: ${result.aiOutput}`);
    }
  } catch (error) {
    console.error('❌ Test 4 failed:', error);
  }

  // Test 5: Operator Agent Mission Execution
  console.log('\n📌 Test 5: Operator Agent Mission Execution');
  console.log('-'.repeat(80));
  const operatorMission = { ...testMission, assigned_to: 'operator', id: 'test-operator-001' };
  try {
    const result = await operatorAgent.execute('mission_execution', operatorMission);
    if (result.success) {
      console.log(`✅ Operator execution successful`);
      console.log(`   Provider: ${result.executionDetails.provider}`);
      console.log(`   Action items: ${result.executionDetails.actionItems?.length || 0}`);
    } else {
      console.log(`⚠️  Operator execution incomplete: ${result.aiOutput}`);
    }
  } catch (error) {
    console.error('❌ Test 5 failed:', error);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✨ TEST SUITE COMPLETE\n');
}

// Run tests
runTests().catch(console.error);
