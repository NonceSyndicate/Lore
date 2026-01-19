# 🔧 APPLY THIS MIGRATION TO FIX SCHEMA

## Error You're Getting
```
Error: column agent_tasks.priority does not exist
```

## Why
The database schema needs to be updated to support the hierarchical mission/task structure:
- **Missions** - High-level goals (47 missions)
- **Tasks** - Steps required to accomplish each mission
- **Subtasks** - Sub-steps within tasks

## How to Fix (2 Steps)

### Step 1: Open Supabase SQL Editor
Go to: https://app.supabase.com/project/teppzapjhkwoguwlfdvy/sql/new

### Step 2: Copy & Execute This Migration

Copy the entire content of:
```
docs/migrations/002_hierarchical_task_system.sql
```

Paste it into the Supabase SQL Editor and click **"Execute"**

## What This Creates

✅ **agent_tasks table** - With all required columns:
- `id` - Unique identifier
- `mission_id` - Parent mission (foreign key)
- `parent_task_id` - Parent task (for subtasks)
- `title` - Task name
- `description` - Task details
- `priority` - critical/high/medium/low ← **THIS FIXES THE ERROR**
- `status` - pending/in_progress/completed/failed
- `assigned_to` - Agent assignment
- `order_index` - Execution order
- `dependencies` - Task dependencies (JSON)
- `context` - Task context (JSON)
- `metadata` - Custom metadata (JSON)
- Timestamps (created_at, updated_at)

✅ **task_logs table** - Audit trail for tasks
- Real-time task execution logging
- Agent type tracking
- Error/warning/info/debug levels

✅ **task_results table** - Task execution output
- AI provider response storage
- Execution plans
- Task completion records

✅ **Indexes** - Performance optimization
- Query missions by status
- Query tasks by priority
- Query by agent type
- Full audit trail

✅ **task_hierarchy view** - Easy task queries
- See all tasks with subtask counts
- View task relationships
- Check completion status

## Verify Success

After executing, run this query to verify:

```sql
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('missions', 'agent_tasks', 'task_logs', 'task_results')
ORDER BY table_name, ordinal_position;
```

Expected output shows all columns for all 4 tables.

## Then What?

Once migration is applied:

1. System will recognize `agent_tasks.priority` column
2. Agent Coordinator can create tasks for missions
3. Hierarchical task execution will work
4. All logging will work properly

## Data Structure

```
Mission (47 total)
├── Task 1 (Steps needed)
│   ├── Subtask 1a
│   ├── Subtask 1b
│   └── Subtask 1c
├── Task 2
│   ├── Subtask 2a
│   └── Subtask 2b
└── Task 3
    └── Subtask 3a
```

This allows:
- ✅ Granular task tracking
- ✅ Task dependencies
- ✅ Parallel execution
- ✅ Better logging/monitoring
- ✅ Task completion verification

---

**Execute the migration now, then the system will be fully operational!** 🚀
