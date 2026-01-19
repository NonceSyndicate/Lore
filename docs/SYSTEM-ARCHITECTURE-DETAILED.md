# 🎯 System Architecture: Task Decomposition Flow

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS MISSION SYSTEM                    │
│                      (30-minute cycles)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌────────────────────┐
                    │ Inngest Cron Job   │
                    │  (every 30 min)    │
                    └────────────────────┘
                              ↓
                ┌──────────────────────────────┐
                │  Signer Orchestrator         │
                │  - Fetch pending mission     │
                │  - Route to agent            │
                └──────────────────────────────┘
                              ↓
         ┌────────────────────┬──────────────────┬────────────────────┐
         ↓                    ↓                  ↓                    ↓
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      ┌─────────────┐
    │  OPERATOR   │   │ RESEARCHER  │   │   SCRIBE    │      │   SIGNER    │
    │   Agent     │   │   Agent     │   │   Agent     │      │   Agent     │
    └─────────────┘   └─────────────┘   └─────────────┘      └─────────────┘
         ↓
    ┌─────────────────────────────────────────────────┐
    │   NEW: Task Decomposition (Just Implemented!)   │
    │                                                  │
    │  1. AI decomposes mission into tasks            │
    │  2. Stores in agent_tasks table                 │
    │  3. Executes each task sequentially             │
    │  4. Logs to task_logs (each action)             │
    │  5. Stores results in task_results              │
    │  6. Updates mission when all complete           │
    └─────────────────────────────────────────────────┘
         ↓
    ┌──────────────────────────────────────┐
    │     Supabase PostgreSQL DB           │
    │  ┌────────────────────────────────┐  │
    │  │   missions (47 strategic)      │  │
    │  ├────────────────────────────────┤  │
    │  │   agent_tasks (NEW)            │  │ ← Requires migration 002!
    │  ├────────────────────────────────┤  │
    │  │   task_logs (NEW)              │  │
    │  ├────────────────────────────────┤  │
    │  │   task_results (NEW)           │  │
    │  ├────────────────────────────────┤  │
    │  │   mission_logs                 │  │
    │  ├────────────────────────────────┤  │
    │  │   mission_results              │  │
    │  └────────────────────────────────┘  │
    └──────────────────────────────────────┘
```

---

## Task Execution Flow (Detailed)

```
MISSION ARRIVES
     │
     ├─ Mission ID: abc-123
     ├─ Title: "Create Presale Offer & Pricing Strategy"
     ├─ Priority: HIGH
     ├─ Assigned: operator
     └─ Status: pending
     
     ↓
     
┌─ STEP 1: DECOMPOSITION ─────────────────────────┐
│                                                  │
│  AI Prompt:                                      │
│  "Break mission into 3-7 tasks with:            │
│   - title, description, priority, order"       │
│                                                  │
│  AI Response (Example):                         │
│  [                                              │
│    {title: "Research Benchmarks",               │
│     description: "...", priority: "high", ...}  │
│    {title: "Design Tiers",                      │
│     description: "...", priority: "high", ...}  │
│    {title: "Calculate Allocations",             │
│     description: "...", priority: "high", ...}  │
│    {title: "Write Documentation",               │
│     description: "...", priority: "medium"...}  │
│  ]                                              │
│                                                  │
└──────────────────────────────────────────────────┘
     ↓
     ├─ Store in agent_tasks table
     │  (mission_id, parent_task_id, priority, status, order_index...)
     │
     └─ Log: "TASK_CREATED" for each task
     
     ↓
     
┌─ STEP 2: SEQUENTIAL EXECUTION ──────────────────┐
│                                                  │
│  FOR EACH TASK (ordered by order_index):       │
│                                                  │
│    A. Update status to "in_progress"            │
│    B. Log: "TASK_STARTED"                       │
│    C. Call AI to execute task                   │
│    D. Store result in task_results              │
│    E. Update status to "completed"              │
│    F. Log: "TASK_COMPLETED"                     │
│                                                  │
│  Example:                                       │
│    ├─ Task 1: "Research..." → AI → Output      │
│    ├─ Task 2: "Design..." → AI → Output         │
│    ├─ Task 3: "Calculate..." → AI → Output      │
│    └─ Task 4: "Documentation..." → AI → Output  │
│                                                  │
└──────────────────────────────────────────────────┘
     ↓
     
┌─ STEP 3: MISSION COMPLETION ────────────────────┐
│                                                  │
│  When ALL tasks complete:                       │
│                                                  │
│    1. Update mission status → "completed"       │
│    2. Set completed_at timestamp                │
│    3. Store in mission_results                  │
│    4. Log: "MISSION_COMPLETED"                  │
│                                                  │
└──────────────────────────────────────────────────┘
     ↓
     
MISSION DONE ✅
Results stored in:
  - agent_tasks (task definitions + status)
  - task_logs (action audit trail)
  - task_results (AI outputs + metrics)
  - missions (mission status)
  - mission_results (overall summary)
```

---

## Database Schema Hierarchy (After Migration 002)

```
┌─────────────────────────────────────────────────────────────┐
│                        MISSIONS TABLE                        │
│  id | title | priority | status | assigned_to | created_at  │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ (foreign key)
                              │
        ┌─────────────────────┴──────────────────────┐
        │                                            │
        │                                            │
┌───────┴──────────────────────────────┐      ┌────┴─────────────────────────────┐
│      AGENT_TASKS TABLE               │      │        TASK_LOGS TABLE           │
│  id                                  │      │  id                              │
│  mission_id ────────────────┐        │      │  task_id (FK) ───────────┐       │
│  parent_task_id ────┐       │        │      │  agent_type              │       │
│  title              │       │        │      │  level (INFO/WARN/ERROR) │       │
│  description        │       │        │      │  action (TASK_STARTED...)│       │
│  priority ◄─────────┤       │        │      │  message                 │       │
│  status             │       │        │      │  created_at              │       │
│  order_index        │       │        │      └──────┬────────────────────┘       │
│  dependencies       │       │        │             │                           │
│  context (JSON)     │       │        │             │                           │
│  created_at         │       │        │             │                           │
│  updated_at         │       │        │             │                           │
└──────────┬──────────┘       │        │             │                           │
           │                  │        │             │                           │
           └── (parent)       │        │             │                           │
              (self-join)     │        │             │                           │
                              │        │             │                           │
        ┌─────────────────────┴────────┴─────────────┴──────────┐               │
        │                                                         │               │
        │                                                         │               │
┌───────┴──────────────────────────────┐    ┌────────────────────┴──────────────┐
│     TASK_RESULTS TABLE               │    │   TASK_HIERARCHY VIEW (QUERY)      │
│  id                                  │    │  id                                │
│  task_id (FK) ───────────────────┐   │    │  mission_id                        │
│  mission_id (FK) ──────────────┐ │   │    │  title                             │
│  agent_type                    │ │   │    │  priority                          │
│  execution_plan                │ │   │    │  status                            │
│  ai_provider                   │ │   │    │  parent_task_id                    │
│  output (AI result)            │ │   │    │  level (root/child)                │
│  metadata (duration, tokens..) │ │   │    │  subtask_count                     │
│  created_at                    │ │   │    │  created_at                        │
└────────────────────────────────┘ │   │    │  updated_at                        │
                                   │   │    └────────────────────────────────────┘
                                   │   │
                                   │   │
                    ┌──────────────┤   │
                    │              │   │
                    ├──────────────┴───┘
                    │
            Links back to
           MISSIONS & TASKS
```

---

## Component Interactions

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  1. MISSION CREATION (Signer Orchestrator)                    │
│     Fetches: missions.status = 'pending'                      │
│     Assigns: To agent (operator, researcher, scribe)          │
│                                                                │
│  2. TASK DECOMPOSITION (New - Operator Agent)                 │
│     Input: Mission object                                     │
│     Process:                                                  │
│       - Generate AI prompt with mission details               │
│       - AI breaks into 3-7 tasks                              │
│       - Validate & parse JSON response                        │
│       - Insert into agent_tasks table                         │
│       - Log each task creation                                │
│     Output: List of created task IDs                          │
│                                                                │
│  3. TASK EXECUTION (Operator Agent)                           │
│     Input: Task object                                        │
│     Process:                                                  │
│       - Update status to 'in_progress'                        │
│       - Log: TASK_STARTED                                     │
│       - Generate AI prompt with task description              │
│       - Call AI provider (with fallback chain)                │
│       - Store result in task_results                          │
│       - Update status to 'completed'                          │
│       - Log: TASK_COMPLETED                                   │
│     Output: Task execution result & metadata                  │
│                                                                │
│  4. MISSION COMPLETION (Operator Agent)                       │
│     Condition: All tasks completed                            │
│     Process:                                                  │
│       - Check all tasks.status = 'completed'                  │
│       - Update mission.status = 'completed'                   │
│       - Set completed_at timestamp                            │
│       - Store in mission_results                              │
│     Output: Mission marked complete                           │
│                                                                │
│  5. MONITORING (Admin Dashboard)                              │
│     Reads: missions, agent_tasks, task_logs, task_results     │
│     Displays:                                                 │
│       - Mission queue (pending)                               │
│       - In-progress missions with task breakdown              │
│       - Execution logs (task_logs entries)                    │
│       - System health                                         │
│     Updates: Every 5 seconds via /api/admin/stats             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## State Transitions

### Mission States
```
pending → in_progress → completed (or failed)
   ↑
   └─ Set when decomposition starts
```

### Task States
```
pending → in_progress → completed (or failed)
   ↑
   └─ For each task in sequence
```

### Full Cycle Example
```
[T=00:00] Mission arrives (pending)
[T=00:05] Agent accepts mission (in_progress)
[T=00:10] Decomposition: Creates 4 tasks (pending)
[T=00:15] Task 1: in_progress → completed
[T=00:20] Task 2: in_progress → completed
[T=00:25] Task 3: in_progress → completed
[T=00:30] Task 4: in_progress → completed
[T=00:35] Mission: in_progress → completed ✅
```

---

## Data Flow: Single Task Example

```
TASK: "Research Market Benchmarks"

1. CREATION
   Input: Mission object + decomposed tasks
   Action: INSERT into agent_tasks
   Fields:
     mission_id: 'abc-123'
     parent_task_id: null (root task)
     title: 'Research Market Benchmarks'
     priority: 'high'
     status: 'pending'
     order_index: 1

2. EXECUTION START
   Action: UPDATE agent_tasks SET status='in_progress'
   Action: INSERT into task_logs (TASK_STARTED)

3. AI PROCESSING
   Prompt: "Research competitor pricing benchmarks..."
   AI Provider: Groq (primary) → Gemini → OpenRouter → Mistral
   Output: "Based on analysis... [detailed findings]"

4. RESULT STORAGE
   Action: INSERT into task_results
   Fields:
     task_id: [generated UUID]
     mission_id: 'abc-123'
     ai_provider: 'groq'
     output: "[AI response]"
     metadata: {
       duration_ms: 2340,
       tokens_used: 1204
     }

5. COMPLETION
   Action: UPDATE agent_tasks SET status='completed'
   Action: INSERT into task_logs (TASK_COMPLETED)

6. VERIFICATION
   Query: SELECT status FROM agent_tasks WHERE id = [task_id]
   Result: 'completed' ✅
```

---

## Key Files

```
/workspaces/Lore/
├── src/agents/operator.ts ← UPDATED (has task decomposition)
│   ├── decomposeMissionIntoTasks() ← NEW
│   └── executeTask() ← NEW
│
├── src/inngest/functions/
│   └── signer-orchestrator.ts (uses operator agent)
│
├── docs/migrations/
│   └── 002_hierarchical_task_system.sql ← MUST EXECUTE
│
├── docs/
│   ├── TASK-DECOMPOSITION-IMPLEMENTATION.md
│   └── MISSION-SYSTEM-ARCHITECTURE.md
│
└── app/
    ├── admin/page.tsx (dashboard - shows missions)
    └── api/admin/stats/route.ts (fetches data)
```

---

## Next Implementation Steps

```
Phase 1: Operator Agent ✅ DONE
├─ decomposeMissionIntoTasks() implemented
├─ executeTask() implemented
├─ task_logs integration added
└─ task_results integration added

Phase 2: Researcher Agent ⏳ READY
├─ Copy pattern from Operator
├─ Adjust AI prompts for research
└─ Deploy

Phase 3: Scribe Agent ⏳ READY
├─ Copy pattern from Operator
├─ Adjust AI prompts for content
└─ Deploy

Phase 4: Enhanced Dashboard ⏳ READY
├─ Add task tree view
├─ Show task progress
├─ Display task logs in real-time
└─ Add task-level metrics

Phase 5: Advanced Features ⏳ FUTURE
├─ Parallel task execution
├─ Task dependencies
├─ Subtasks (child tasks)
└─ Retry logic
```

---

## Success Metrics

After migration is executed:

| Metric | Before | After |
|--------|--------|-------|
| **Execution Granularity** | Mission-level (1 unit) | Task-level (3-7 units) |
| **Progress Tracking** | 0% or 100% | 0-100% per task |
| **Error Isolation** | Mission fails entirely | Individual tasks fail |
| **Logging Detail** | Low (mission logs only) | High (task + mission logs) |
| **AI Calls per Mission** | 1 big prompt | 3-7 focused prompts |
| **Execution Time** | Long (waits for AI) | Same or faster (better AI caching) |
| **Monitoring Visibility** | Dashboard shows mission | Dashboard shows tasks too |

---

This system is now ready to:
- ✅ Execute missions autonomously every 30 minutes
- ✅ Decompose each into granular tasks
- ✅ Track progress at task level
- ✅ Log all activities comprehensively
- ✅ Store results for analysis

**All you need to do:** Execute that one SQL migration! 🚀
