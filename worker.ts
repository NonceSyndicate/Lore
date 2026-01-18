import 'dotenv/config';
import { supabase } from './src/inngest/client';
import * as operatorAgent from './src/agents/operator';
import * as researcherAgent from './src/agents/researcher';
import * as scribeAgent from './src/agents/scribe';

// Map agent types to their execute functions
const agentHandlers: Record<string, any> = {
  OPERATOR: operatorAgent,
  RESEARCHER: researcherAgent,
  SCRIBE: scribeAgent,
};

/**
 * Execute a task with the appropriate agent
 * Routes to the correct agent, executes the task, and updates database
 */
async function executeTask(task: any, agentType: string): Promise<void> {
  const taskId = task.id;
  const startTime = Date.now();

  try {
    // Get the agent handler
    const handler = agentHandlers[agentType];
    if (!handler) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    console.log(`\n   🎯 ${agentType} executing task ${task.id}`);
    console.log(`      Task Type: ${task.task_type}`);

    // Execute the task with the agent
    const result = await handler.execute(task.task_type, task.input_data || {});
    const executionTime = Date.now() - startTime;

    console.log(`   ✨ ${agentType} completed task ${taskId} (${executionTime}ms)`);

    // Update task with results
    const { error: updateError } = await supabase
      .from('agent_tasks')
      .update({
        status: 'completed',
        result,
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (updateError) {
      console.error(`   ❌ Failed to update task result: ${updateError.message}`);
      // Try to mark as failed
      await markTaskFailed(taskId, `Update failed: ${updateError.message}`);
    }
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error(`   ❌ ${agentType} failed on task ${taskId}: ${error.message} (${executionTime}ms)`);

    // Mark task as failed
    await markTaskFailed(taskId, error.message || 'Unknown error');
  }
}

/**
 * Mark a task as failed in the database
 */
async function markTaskFailed(taskId: string, errorMessage: string): Promise<void> {
  const { error } = await supabase
    .from('agent_tasks')
    .update({
      status: 'failed',
      result: { error: errorMessage },
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) {
    console.error(`   ⚠️  Failed to mark task as failed: ${error.message}`);
  }
}

async function startWorker() {
  console.log('🔨 Nonce Syndicate Worker starting...');
  console.log('📡 Connecting to Supabase...\n');
  
  try {
    // Verify environment variables are loaded
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY && !process.env.SUPABASE_ANON_KEY) {
      console.error('❌ Missing Supabase credentials in .env file');
      console.error('   Required: SUPABASE_URL and (SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY)');
      process.exit(1);
    }
    
    console.log(`📍 Supabase URL: ${process.env.SUPABASE_URL}`);
    const keyType = process.env.SUPABASE_SERVICE_KEY ? 'Service Key' : 'Anon Key';
    console.log(`🔑 Using: ${keyType} (${process.env.SUPABASE_SERVICE_KEY?.substring(0, 15) || process.env.SUPABASE_ANON_KEY?.substring(0, 15)}...)`);
    
    // Test Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('agent_state')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.warn('⚠️  Supabase connection test failed:', testError.message);
      console.log('💡 Tip: Verify your API key in Supabase dashboard (Settings → API)');
    } else {
      console.log('✅ Supabase connected successfully');
    }
    console.log('⏰ Running every 5 minutes (5 seconds in demo)');
    console.log('👁️  Watching for pending tasks...\n');
    
    // Agent coordinator loop - fetches from real Supabase
    async function coordinatorLoop() {
      try {
        console.log('🟢 Coordinator checking for tasks...');
        
        // Step 1: Fetch pending tasks from Supabase
        const { data: pendingTasks, error: tasksError } = await supabase
          .from('agent_tasks')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: true });
        
        if (tasksError) throw tasksError;
        
        if (!pendingTasks || pendingTasks.length === 0) {
          console.log('📋 No pending tasks found\n');
          return;
        }
        
        console.log(`📝 Found ${pendingTasks.length} pending tasks:`);
        pendingTasks.forEach((task: any) => {
          console.log(`   ✓ [${task.agent_type}] ${task.description || task.task_type}`);
        });
        
        // Step 2: Fetch idle agents from Supabase
        const { data: agentStates, error: agentsError } = await supabase
          .from('agent_state')
          .select('*')
          .eq('status', 'idle');
        
        if (agentsError) throw agentsError;
        
        if (!agentStates || agentStates.length === 0) {
          console.log('⚠️  No idle agents available\n');
          return;
        }
        
        console.log(`\n📋 Idle agents: ${agentStates.length}`);
        agentStates.forEach((agent: any) => {
          console.log(`   ✓ ${agent.agent_type}`);
        });
        
        // Step 3: Assign tasks to agents
        console.log('\n🔄 Task Assignment:\n');
        let assignedCount = 0;
        
        for (const task of pendingTasks) {
          const agent = agentStates.find((a: any) => a.agent_type === task.agent_type);
          if (!agent) continue;
          
          console.log(`   ✅ Task ${task.id} → ${agent.agent_type}`);
          console.log(`      ${task.description}`);
          
          // Update task status to 'in_progress' in Supabase
          const { error: taskUpdateError } = await supabase
            .from('agent_tasks')
            .update({
              status: 'in_progress',
              updated_at: new Date().toISOString(),
            })
            .eq('id', task.id);
          
          if (taskUpdateError) {
            console.error(`   ❌ Failed to update task: ${taskUpdateError.message}`);
            continue;
          }
          
          // Update agent state to 'active' in Supabase
          const { error: agentUpdateError } = await supabase
            .from('agent_state')
            .update({
              status: 'active',
              current_task_id: task.id,
              last_active: new Date().toISOString(),
            })
            .eq('agent_type', agent.agent_type);
          
          if (agentUpdateError) {
            console.error(`   ❌ Failed to update agent: ${agentUpdateError.message}`);
            console.error(`      Details: ${JSON.stringify(agentUpdateError.details)}`);
            console.error(`      Hint: ${agentUpdateError.hint}`);
            continue;
          }
          
          assignedCount++;
          
          // Execute task asynchronously (don't wait for completion)
          executeTask(task, agent.agent_type).then(() => {
            // After task completes, mark agent as idle
            supabase
              .from('agent_state')
              .update({
                status: 'idle',
                current_task_id: null,
                last_active: new Date().toISOString(),
              })
              .eq('agent_type', agent.agent_type)
              .then(({ error }) => {
                if (error) {
                  console.error(`   ⚠️  Failed to mark ${agent.agent_type} as idle: ${error.message}`);
                }
              });
          }).catch((error) => {
            console.error(`   ❌ Task execution error for ${agent.agent_type}: ${error.message}`);
          });
        }
        
        console.log(`\n📊 Summary:`);
        console.log(`   Assigned: ${assignedCount}`);
        console.log(`   Remaining pending: ${pendingTasks.length - assignedCount}`);
        console.log(`\n⏰ Next check in 5 seconds...\n`);
        
      } catch (error) {
        console.error('❌ Coordinator loop error:', error);
      }
    }
    
    // Run coordinator immediately
    await coordinatorLoop();
    
    // Run coordinator every 5 seconds for demo (normally 300000ms = 5 minutes)
    setInterval(coordinatorLoop, 5000);
    
  } catch (error) {
    console.error('❌ Worker initialization failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Shutting down worker...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Shutting down worker...');
  process.exit(0);
});

startWorker();
