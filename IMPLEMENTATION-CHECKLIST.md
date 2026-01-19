# ✅ IMPLEMENTATION CHECKLIST

## Phase 1: Database Schema (CRITICAL - MUST DO NOW) ⏱️ 2 minutes

- [ ] Open Supabase SQL Editor: https://app.supabase.com/project/teppzapjhkwoguwlfdvy/sql/new
- [ ] Copy `/docs/migrations/002_hierarchical_task_system.sql`
- [ ] Paste into SQL Editor
- [ ] Click **Execute**
- [ ] Verify success message (no errors)

**Result:** 4 new tables created:
- [x] agent_tasks ← Fixes the "priority column missing" error
- [x] task_logs
- [x] task_results
- [x] task_hierarchy (view)

---

## Phase 2: Code Deployment (ALREADY DONE ✅)

- [x] Operator agent updated with `decomposeMissionIntoTasks()`
- [x] Operator agent updated with `executeTask()`
- [x] Task logging integrated (task_logs)
- [x] Task result storage integrated (task_results)
- [x] Build successful (zero errors)
- [x] Code pushed to GitHub (commit: 7998de0)
- [x] Vercel auto-deployed

**Result:** Next mission cycle will automatically use task decomposition.

---

## Phase 3: Verification (AFTER YOU EXECUTE MIGRATION) ⏱️ 30 minutes

Wait for next mission cycle (approximately 30 minutes from now):

- [ ] Next mission starts in signer orchestrator
- [ ] Check Supabase: agent_tasks table has new rows
- [ ] Each task created with proper fields:
  - [ ] mission_id (linked)
  - [ ] title (task name)
  - [ ] priority (critical/high/medium/low)
  - [ ] status (pending → in_progress → completed)
  - [ ] order_index (sequence)
- [ ] task_logs table records actions
- [ ] task_results table stores AI outputs
- [ ] Mission marks complete when all tasks done

**Verification Queries:**
```sql
-- Check tasks for most recent mission
SELECT id, title, priority, status, order_index 
FROM agent_tasks 
ORDER BY created_at DESC LIMIT 10;

-- Check task logs
SELECT action, message, level, created_at 
FROM task_logs 
ORDER BY created_at DESC LIMIT 20;

-- Check task results
SELECT task_id, ai_provider, LENGTH(output) as output_chars, 
       (metadata->>'duration_ms')::int as duration_ms 
FROM task_results 
ORDER BY created_at DESC LIMIT 10;
```

---

## Phase 4: Monitor (OPTIONAL - NICE TO HAVE)

### Option A: Admin Dashboard (Real-Time)
- [ ] Visit: https://lore.vercel.app/admin
- [ ] Refresh every 5 seconds
- [ ] Watch mission queue
- [ ] Watch execution logs
- [ ] System should show: "Total Missions: 47"
- [ ] Next 30-min cycle will show decomposed tasks

### Option B: Supabase Console
- [ ] Go to: https://app.supabase.com/project/teppzapjhkwoguwlfdvy/editor
- [ ] Click: agent_tasks table
- [ ] Refresh every 5 minutes
- [ ] Watch for new rows appearing

### Option C: Query Terminal
```bash
# SSH into Supabase if you have CLI access
# Or use Supabase console directly
```

---

## Phase 5: Extend to Other Agents (OPTIONAL - FUTURE) ⏱️ 2-3 hours

Once confirmed working with Operator:

### Researcher Agent
- [ ] Copy `decomposeMissionIntoTasks()` from operator.ts
- [ ] Copy `executeTask()` from operator.ts
- [ ] Adjust AI system prompt for research context
- [ ] Adjust AI task execution prompt for research
- [ ] Test with next researcher mission

### Scribe Agent
- [ ] Copy `decomposeMissionIntoTasks()` from operator.ts
- [ ] Copy `executeTask()` from operator.ts
- [ ] Adjust AI system prompt for content/writing context
- [ ] Adjust AI task execution prompt for writing
- [ ] Test with next scribe mission

**Pattern:** All agents use same table structure, different AI prompts.

---

## Phase 6: Enhanced Dashboard (OPTIONAL - NICE TO HAVE) ⏱️ 1-2 hours

After task decomposition is stable:

### Add Task Tree View
- [ ] Update `/app/admin/page.tsx`
- [ ] Add expandable task list under each mission
- [ ] Show task priority as badge
- [ ] Show task status as color-coded
- [ ] Show task results on expand
- [ ] Add real-time updates to task tree

### Add Task Metrics
- [ ] Update `/app/api/admin/stats/route.ts`
- [ ] Return task counts (pending/in_progress/completed/failed)
- [ ] Return average task execution time
- [ ] Return tasks per mission
- [ ] Return task success rate

### Update Dashboard Display
- [ ] Show task breakdown for each mission
- [ ] Show task logs in real-time
- [ ] Add task status timeline
- [ ] Add task performance metrics

---

## Success Criteria

### Minimum Success (after migration):
- ✅ No SQL errors when executing migration
- ✅ agent_tasks table exists with all columns
- ✅ Next mission creates tasks automatically
- ✅ Tasks execute sequentially
- ✅ No "column priority does not exist" error

### Full Success (after first mission cycle):
- ✅ Mission receives
- ✅ Gets decomposed into 3-7 tasks
- ✅ Each task has: title, priority, status, order
- ✅ task_logs records each action
- ✅ task_results stores AI output
- ✅ Mission complete when all tasks done
- ✅ Admin dashboard still works
- ✅ All 47 missions still in queue

### Enhanced Success (optional):
- ✅ Other agents (Researcher, Scribe) also decomposing tasks
- ✅ Admin dashboard shows task trees
- ✅ Task-level metrics tracked
- ✅ Historical analysis possible

---

## Timeline

```
Now             │ ← YOU ARE HERE
├─ Execute migration (30 sec)
│
~30 min         │ First task-decomposed mission starts
├─ Decomposition: 3-7 tasks created
├─ Execution: Each task runs with AI
├─ Logging: All actions recorded
├─ Completion: Mission done when tasks done
│
~30 min later   │ Second mission cycle (also decomposed)
├─ Verify pattern working
├─ Check admin dashboard
├─ Check Supabase tables
│
~24 hours       │ Extend to other agents
├─ Copy pattern to Researcher
├─ Copy pattern to Scribe
├─ Test with their missions
│
~48 hours       │ Enhance dashboard
├─ Add task tree view
├─ Add task metrics
├─ Full visibility achieved
```

---

## Rollback Plan (If Something Goes Wrong)

### If Migration Fails
```
Solution: Run the SQL again (it's idempotent - safe to re-run)
1. Go to Supabase SQL Editor
2. Copy and paste the entire 002_hierarchical_task_system.sql
3. Click Execute
4. It will skip any tables that already exist
```

### If Agent Breaks
```
Solution: Revert commit 7998de0
1. git revert 7998de0
2. git push origin main
3. Vercel will auto-redeploy old version
4. Missions will execute without decomposition (old style)
```

### If Tasks Don't Create
```
Debugging:
1. Check Supabase tables exist:
   SELECT * FROM information_schema.tables 
   WHERE table_name IN ('agent_tasks', 'task_logs', 'task_results');

2. Check logs in Inngest dashboard
   
3. Verify Operator agent is being called:
   SELECT * FROM mission_logs 
   ORDER BY created_at DESC LIMIT 5;

4. Check for errors in task_logs:
   SELECT * FROM task_logs 
   WHERE level = 'ERROR' 
   ORDER BY created_at DESC;
```

### If Performance Issues
```
Check query performance:
SELECT 
  tablename,
  indexname
FROM pg_indexes 
WHERE tablename IN ('agent_tasks', 'task_logs', 'task_results');

Indexes should exist:
- agent_tasks: mission, parent, status, priority, assigned_to
- task_logs: task, agent_type, created_at
- task_results: task, mission, agent_type
```

---

## Support Commands

### Verify Database Setup
```sql
-- Check all required tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('missions', 'agent_tasks', 'task_logs', 'task_results');

-- Check columns in agent_tasks
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agent_tasks' 
ORDER BY ordinal_position;

-- Count existing data
SELECT 
  (SELECT COUNT(*) FROM missions) as total_missions,
  (SELECT COUNT(*) FROM agent_tasks) as total_tasks,
  (SELECT COUNT(*) FROM task_logs) as total_task_logs,
  (SELECT COUNT(*) FROM task_results) as total_task_results;
```

### Monitor Task Execution
```sql
-- Latest tasks
SELECT id, mission_id, title, priority, status, created_at 
FROM agent_tasks 
ORDER BY created_at DESC 
LIMIT 10;

-- Latest task activities
SELECT task_id, action, message, level, created_at 
FROM task_logs 
ORDER BY created_at DESC 
LIMIT 20;

-- Task execution results
SELECT 
  tr.task_id,
  tr.ai_provider,
  LENGTH(tr.output) as output_length,
  (tr.metadata->>'duration_ms')::int as duration_ms,
  tr.created_at
FROM task_results tr
ORDER BY tr.created_at DESC 
LIMIT 10;
```

### Check Mission Status
```sql
-- All missions by status
SELECT status, COUNT(*) as count 
FROM missions 
GROUP BY status;

-- Most recently updated missions
SELECT id, title, priority, status, assigned_to, updated_at 
FROM missions 
ORDER BY updated_at DESC 
LIMIT 10;

-- Get tasks for specific mission
SELECT id, title, priority, status, order_index 
FROM agent_tasks 
WHERE mission_id = '[MISSION_ID]' 
ORDER BY order_index;
```

---

## Quick Reference

### Key Files
| File | Purpose | Status |
|------|---------|--------|
| `/docs/migrations/002_hierarchical_task_system.sql` | DB migration | ⏳ NEEDS EXECUTION |
| `/src/agents/operator.ts` | Operator with decomposition | ✅ DONE |
| `/src/inngest/functions/signer-orchestrator.ts` | Mission orchestrator | ✅ READY |
| `/app/admin/page.tsx` | Dashboard | ✅ LIVE |
| `/app/api/admin/stats/route.ts` | Stats API | ✅ LIVE |

### Key Tables
| Table | Columns | Purpose | Status |
|-------|---------|---------|--------|
| `missions` | id, title, priority, status, assigned_to... | Mission definitions | ✅ EXISTS |
| `agent_tasks` | id, mission_id, parent_task_id, title, **priority**, status... | Tasks for missions | ⏳ NEEDS MIGRATION |
| `task_logs` | id, task_id, agent_type, action, message, level... | Audit trail | ⏳ NEEDS MIGRATION |
| `task_results` | id, task_id, mission_id, ai_provider, output... | AI outputs | ⏳ NEEDS MIGRATION |

### Key Functions (Agent)
| Function | Location | Status |
|----------|----------|--------|
| `decomposeMissionIntoTasks()` | `src/agents/operator.ts` | ✅ DONE |
| `executeTask()` | `src/agents/operator.ts` | ✅ DONE |
| `callAI()` | `src/utils/ai-provider.ts` | ✅ DONE |

---

## Final Checklist Before Launching

- [ ] **CRITICAL:** Execute migration SQL in Supabase
- [ ] Verify: agent_tasks table exists
- [ ] Verify: priority column exists
- [ ] Verify: task_logs table exists
- [ ] Verify: task_results table exists
- [ ] Verify: task_hierarchy view exists
- [ ] Verify: No errors in Supabase SQL editor
- [ ] Watch: Next mission cycle (in ~30 min)
- [ ] Verify: Tasks created automatically
- [ ] Verify: Tasks execute sequentially
- [ ] Verify: Admin dashboard still works
- [ ] Monitor: First 3-4 cycles (next 2 hours)
- [ ] Document: Any issues or observations

---

## Support Resources

- **Main Docs:** `/docs/mission-system-architecture.md`
- **Task Guide:** `/docs/TASK-DECOMPOSITION-IMPLEMENTATION.md`
- **Architecture:** `/docs/SYSTEM-ARCHITECTURE-DETAILED.md`
- **Quick Start:** `/TASK-DECOMPOSITION-READY.md`
- **Admin:** `https://lore.vercel.app/admin`
- **GitHub:** `https://github.com/NonceSyndicate/Lore`

---

## You're Ready! 🚀

Everything is prepared and deployed. The system is waiting for one thing:

**Execute that SQL migration in Supabase** (30 seconds)

Then sit back and watch your autonomous agents decompose missions into granular, tracked, AI-powered tasks! ✨
