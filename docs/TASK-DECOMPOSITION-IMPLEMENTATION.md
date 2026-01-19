# 📋 Task Decomposition Implementation Guide

## Overview
This guide explains how agents will decompose missions into tasks and subtasks using the hierarchical database structure.

## Database Schema (After Migration 002)

### Hierarchy Structure
```
Mission (top-level goal)
├── Task 1 (step)
│   ├── Subtask 1.1
│   ├── Subtask 1.2
│   └── Subtask 1.3
├── Task 2 (step)
└── Task 3 (step)
```

### Key Tables
- **missions** - High-level goals (47 total)
- **agent_tasks** - Steps/subtasks with hierarchy support
  - `mission_id` - Links to parent mission
  - `parent_task_id` - Links to parent task (NULL for root tasks)
  - `priority` - critical/high/medium/low
  - `status` - pending/in_progress/completed/failed
  - `assigned_to` - Agent assigned to this task
  - `order_index` - Execution order
  - `dependencies` - JSON array of task IDs this depends on
- **task_logs** - Task-level audit trail
- **task_results** - Task execution output

## Implementation Pattern

### Phase 1: Mission Reception (Already Implemented ✅)
Agent receives mission from `signer-orchestrator`:
```typescript
// In signer-orchestrator.ts (lines 50-75)
const mission = await supabase
  .from('missions')
  .select('*')
  .eq('status', 'pending')
  .limit(1)
  .single();
```

### Phase 2: Task Decomposition (TO IMPLEMENT)
Agent analyzes mission and creates tasks:

```typescript
// In each agent (operator.ts, researcher.ts, scribe.ts)
async function decomposeMissionIntoTasks(mission: any) {
  // 1. Call AI to break down mission into tasks
  const decompositionPrompt = `
    Mission: ${mission.title}
    Description: ${mission.description}
    
    Break this mission into 3-7 concrete, executable tasks.
    For each task:
    - Title (short, action-oriented)
    - Description (what needs to happen)
    - Priority (critical/high/medium/low)
    - Order (1, 2, 3, ...)
    - Dependencies (which tasks must complete first)
    
    Return as JSON array.
  `;
  
  const aiResponse = await callAI(decompositionPrompt);
  const tasks = JSON.parse(aiResponse);
  
  // 2. Store tasks in agent_tasks table
  const createdTasks = [];
  for (const task of tasks) {
    const { data, error } = await supabase
      .from('agent_tasks')
      .insert({
        mission_id: mission.id,
        parent_task_id: null, // Root tasks
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: 'pending',
        assigned_to: mission.assigned_to,
        order_index: task.order,
        dependencies: task.dependencies || [],
        context: { mission_objectives: mission.context.objectives }
      })
      .select();
    
    if (error) throw error;
    createdTasks.push(data[0]);
  }
  
  return createdTasks;
}
```

### Phase 3: Task Execution (TO IMPLEMENT)
Agent executes tasks sequentially:

```typescript
// In each agent
async function executeTasks(missionId: string, tasks: any[]) {
  for (const task of tasks) {
    // 1. Update task status to in_progress
    await supabase
      .from('agent_tasks')
      .update({ status: 'in_progress' })
      .eq('id', task.id);
    
    // 2. Log task start
    await supabase
      .from('task_logs')
      .insert({
        task_id: task.id,
        agent_type: mission.assigned_to,
        level: 'INFO',
        action: 'TASK_STARTED',
        message: `Starting task: ${task.title}`
      });
    
    // 3. Generate subtasks if needed
    const subtasks = await generateSubtasks(task);
    for (const subtask of subtasks) {
      await supabase.from('agent_tasks').insert({
        mission_id: missionId,
        parent_task_id: task.id, // Link to parent task
        title: subtask.title,
        description: subtask.description,
        priority: subtask.priority,
        status: 'pending',
        assigned_to: mission.assigned_to,
        order_index: subtask.order,
        context: { parent_task: task.title }
      });
    }
    
    // 4. Execute task with AI
    const execution = await callAI(`Execute this task:\n${task.description}`);
    
    // 5. Store execution result
    await supabase
      .from('task_results')
      .insert({
        task_id: task.id,
        mission_id: missionId,
        agent_type: mission.assigned_to,
        ai_provider: 'groq', // or whichever was used
        output: execution,
        metadata: { duration_ms: Date.now() - startTime }
      });
    
    // 6. Update task status to completed
    await supabase
      .from('agent_tasks')
      .update({ status: 'completed' })
      .eq('id', task.id);
    
    // 7. Log task completion
    await supabase
      .from('task_logs')
      .insert({
        task_id: task.id,
        agent_type: mission.assigned_to,
        level: 'INFO',
        action: 'TASK_COMPLETED',
        message: `Completed task: ${task.title}`
      });
  }
}
```

### Phase 4: Mission Completion (Already Partially Implemented)
After all tasks complete, mark mission as complete:

```typescript
// In signer-orchestrator.ts
await supabase
  .from('missions')
  .update({ 
    status: 'completed',
    completed_at: new Date().toISOString()
  })
  .eq('id', mission.id);
```

## Implementation Checklist

- [ ] **Step 1: Execute Migration 002**
  - Go to: https://app.supabase.com/project/teppzapjhkwoguwlfdvy/sql/new
  - Copy: `/docs/migrations/002_hierarchical_task_system.sql`
  - Execute in Supabase SQL Editor
  - Verify: 4 new tables created

- [ ] **Step 2: Update Agent Structure**
  - In `src/agents/operator.ts`: Add `decomposeMissionIntoTasks()` function
  - In `src/agents/researcher.ts`: Add `decomposeMissionIntoTasks()` function
  - In `src/agents/scribe.ts`: Add `decomposeMissionIntoTasks()` function
  - Each agent should have same interface but different AI prompts

- [ ] **Step 3: Enhance Mission Execution**
  - Update `executeMission()` in each agent to:
    1. Decompose mission into tasks
    2. Execute tasks sequentially
    3. Generate subtasks as needed
    4. Log all activity to task_logs
    5. Store results in task_results

- [ ] **Step 4: Update Signer Orchestrator**
  - Ensure mission status transitions work correctly
  - Add task completion tracking
  - Update mission results to include task hierarchy

- [ ] **Step 5: Enhance Admin Dashboard**
  - Add expandable task tree view in `/app/admin/page.tsx`
  - Show task status, priority, assigned agent
  - Display task_logs in real-time
  - Show task execution results

## Example: Operator Task Decomposition

For a mission like:
```
Title: "💰 HIGH: Create Presale Offer & Pricing Strategy"
```

AI would decompose into tasks:
```json
[
  {
    "title": "Research Market Pricing Benchmarks",
    "description": "Analyze competitor presale pricing and token economics",
    "priority": "high",
    "order": 1,
    "dependencies": []
  },
  {
    "title": "Design Presale Tiers",
    "description": "Create 3-4 presale tiers with different benefits",
    "priority": "high",
    "order": 2,
    "dependencies": [1]
  },
  {
    "title": "Calculate Allocation Limits",
    "description": "Determine per-wallet and total allocation limits",
    "priority": "high",
    "order": 3,
    "dependencies": [2]
  },
  {
    "title": "Write Presale Documentation",
    "description": "Create terms, benefits, and FAQ documentation",
    "priority": "medium",
    "order": 4,
    "dependencies": [2]
  }
]
```

## Integration Timeline

**Immediate (Next Cycle):**
1. Execute migration 002 in Supabase
2. Update one agent (Operator) with decomposition logic
3. Test with a single mission

**Next 24 Hours:**
1. Replicate to Researcher and Scribe agents
2. Test full end-to-end flow
3. Monitor task execution via admin dashboard

**Next 48 Hours:**
1. Enhance admin dashboard with task tree view
2. Add task-level metrics to stats API
3. Verify all agents properly decomposing missions

## Testing Checklist

After implementing, verify:
- [ ] Agent decomposes mission into 3-7 tasks
- [ ] Each task stored in agent_tasks with proper hierarchy
- [ ] Tasks execute sequentially with proper status updates
- [ ] task_logs records each task action
- [ ] task_results captures AI output
- [ ] Admin dashboard shows task tree
- [ ] Mission marked complete when all tasks done
- [ ] Failed tasks logged with error details

## Query Examples

### Get all tasks for a mission:
```sql
SELECT * FROM agent_tasks 
WHERE mission_id = 'YOUR_MISSION_ID' 
ORDER BY order_index;
```

### Get task hierarchy:
```sql
SELECT * FROM task_hierarchy 
WHERE mission_id = 'YOUR_MISSION_ID';
```

### Get task execution logs:
```sql
SELECT * FROM task_logs 
WHERE task_id = 'YOUR_TASK_ID' 
ORDER BY created_at DESC;
```

### Get task results:
```sql
SELECT * FROM task_results 
WHERE mission_id = 'YOUR_MISSION_ID' 
ORDER BY created_at DESC;
```

## Next Steps

1. **CRITICAL:** Execute migration 002 in Supabase
2. Implement decomposition in first agent (Operator)
3. Test with next autonomous mission cycle (in ~30 minutes)
4. Monitor execution and refine as needed
5. Roll out to other agents
