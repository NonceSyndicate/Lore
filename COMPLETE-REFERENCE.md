# 📖 COMPLETE REFERENCE GUIDE

## 🎯 Current Status

**System:** Live and executing autonomously every 30 minutes ✅
**Missions:** 47 strategic missions queued and ready ✅
**Code:** Task decomposition implemented and deployed ✅
**Database:** Migration script ready, awaiting execution ⏳

---

## 🚀 ONE ACTION NEEDED

### Execute This SQL Migration (2 minutes)

**Location:** https://app.supabase.com/project/teppzapjhkwoguwlfdvy/sql/new

**Copy from:** `/docs/migrations/002_hierarchical_task_system.sql`

**Steps:**
1. Open the SQL Editor link above
2. Copy the entire migration file
3. Paste into the editor
4. Click Execute button
5. Wait for ✅ Success message

**Result:** 
- ✅ agent_tasks table created (with priority column - fixes error!)
- ✅ task_logs table created
- ✅ task_results table created
- ✅ task_hierarchy view created
- ✅ Proper indexes created for performance

---

## 📚 Documentation by Use Case

### "I want to understand what's happening"
→ Read: `TASK-DECOMPOSITION-READY.md` (5 min read)

### "I need step-by-step instructions"
→ Read: `IMPLEMENTATION-CHECKLIST.md` (quick reference)

### "I want the technical details"
→ Read: `TASK-DECOMPOSITION-IMPLEMENTATION.md` (detailed code)

### "I need to see architecture diagrams"
→ Read: `docs/SYSTEM-ARCHITECTURE-DETAILED.md` (visual flow charts)

### "I need the executive summary"
→ Read: `TASK-DECOMPOSITION-SUMMARY.md` (overview)

### "I need the complete picture"
→ Read: This document (comprehensive guide)

---

## 🔄 How It Works (High Level)

```
Every 30 Minutes:
1. Get next pending mission from queue
2. Send to assigned agent (Operator, Researcher, or Scribe)
3. Agent decomposes mission into 3-7 tasks
4. Each task executes with AI independently
5. All activities logged at task level
6. Mission complete when all tasks finish
7. Everything stored in database for analysis
```

---

## 📊 Data Structure (After Migration)

### missions table (already exists)
- 47 strategic missions
- Assigned to: signer, operator, researcher, scribe
- Status: pending → in_progress → completed
- Created by: seed-epic-missions.ts

### agent_tasks table (⏳ needs migration)
- Task definitions for each mission
- Hierarchical (parent_task_id for subtasks)
- 3-7 tasks per mission
- Status tracked per task
- Created by: operator.decomposeMissionIntoTasks()

### task_logs table (⏳ needs migration)
- Audit trail for each task
- Actions: CREATED, STARTED, COMPLETED, FAILED
- Levels: INFO, WARN, ERROR, DEBUG
- Real-time tracking of execution

### task_results table (⏳ needs migration)
- AI output storage
- Execution metrics (duration, tokens)
- Provider information
- Full result text

---

## 🎮 Monitoring Points

### Real-Time Dashboard
```
URL: https://lore.vercel.app/admin
Refresh: Every 5 seconds (auto)
Shows: Missions, logs, health, system stats
```

### Supabase Console
```
URL: https://app.supabase.com/project/teppzapjhkwoguwlfdvy/editor
Tables: missions, agent_tasks, task_logs, task_results
Browse: Real-time data updates
```

### Direct Queries
```sql
-- Check latest tasks
SELECT * FROM agent_tasks ORDER BY created_at DESC LIMIT 10;

-- Check task logs
SELECT * FROM task_logs ORDER BY created_at DESC LIMIT 20;

-- Check task results
SELECT * FROM task_results ORDER BY created_at DESC LIMIT 10;
```

---

## 🏗️ Current Architecture

```
┌─────────────────────────────────────────────┐
│  AUTONOMOUS MISSION SYSTEM (LIVE ✅)        │
└─────────────────────────────────────────────┘
         ↓
    [Inngest Cron]
    (Every 30 min)
         ↓
  [Signer Orchestrator]
  - Fetch mission
  - Route to agent
         ↓
    ┌────┬────┬────┬────┐
    ↓    ↓    ↓    ↓    ↓
 [Signer] [Operator] [Researcher] [Scribe]
    ↓         ↓           ↓          ↓
    │    [NEW: Task     [NEW: Task  [NEW: Task
    │     Decomposition Decomposition Decomposition]
    │     (Ready)] (Ready)] (Ready)]
    │         ↓           ↓          ↓
    └─────────┴───────────┴──────────┘
              ↓
     [Supabase Database]
     - missions
     - agent_tasks (⏳)
     - task_logs (⏳)
     - task_results (⏳)
     - mission_logs
     - mission_results
              ↓
        [Analysis & Monitoring]
        - Admin Dashboard
        - Real-time stats
        - Execution tracking
```

---

## 🧠 What Each Agent Does

### Operator Agent ✅
- **Responsible for:** Operational tasks, project execution
- **Decomposition:** Creates execution-oriented tasks
- **Status:** Task decomposition IMPLEMENTED ✅
- **Example Mission:** "Create Presale Offer & Pricing Strategy"
- **Example Tasks:**
  1. Research market benchmarks
  2. Design presale tiers
  3. Calculate allocations
  4. Write documentation

### Researcher Agent ⏳
- **Responsible for:** Research, analysis, market intelligence
- **Decomposition:** Ready to implement (copy pattern from Operator)
- **Status:** Task decomposition READY (not yet implemented)
- **Example Mission:** "Deep Research Twitter Community Trends"
- **Example Tasks:**
  1. Identify trending topics
  2. Analyze community sentiment
  3. Research competitor strategies
  4. Compile findings

### Scribe Agent ⏳
- **Responsible for:** Content creation, writing, documentation
- **Decomposition:** Ready to implement (copy pattern from Operator)
- **Status:** Task decomposition READY (not yet implemented)
- **Example Mission:** "Create Marketing Landing Page Copy"
- **Example Tasks:**
  1. Define landing page sections
  2. Write hero section copy
  3. Write features section
  4. Write CTA copy

### Signer Agent ✅
- **Responsible for:** High-level strategic coordination
- **Special Role:** Routes missions to other agents
- **Status:** Orchestration working, doesn't need decomposition
- **Next Steps:** May route complex missions to multiple agents

---

## 📅 Timeline

```
NOW                Execute migration (2 min)
↓
+30 min           First decomposed mission starts
                  - Tasks created automatically
                  - Each task executes with AI
                  - All logged independently
↓
+1-2 hours        Monitor execution
                  - Check admin dashboard
                  - Verify task_logs populated
                  - Verify task_results stored
↓
+24 hours         Extend to other agents
                  - Copy pattern to Researcher
                  - Copy pattern to Scribe
                  - Test with their missions
↓
+48 hours         Enhance dashboard
                  - Add task tree view
                  - Show task status
                  - Display metrics
↓
Ongoing           Monitor and optimize
                  - Track success metrics
                  - Adjust AI prompts
                  - Improve task decomposition
```

---

## ✅ Deployment Status

| Component | Status | Location |
|-----------|--------|----------|
| **Code** | ✅ Live | Vercel (lore.vercel.app) |
| **Database** | ⏳ Pending | Migration script ready |
| **Documentation** | ✅ Complete | 5 guides in repo |
| **Admin Dashboard** | ✅ Live | lore.vercel.app/admin |
| **API Endpoints** | ✅ Live | /api/admin/stats |
| **Scheduling** | ✅ Live | Inngest (30-min cron) |

---

## 🔍 How to Verify It's Working

### Immediate Check (After Migration)
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('agent_tasks', 'task_logs', 'task_results');

-- Should see 3 rows: agent_tasks, task_logs, task_results ✅
```

### After First Mission (In ~30 minutes)
```sql
-- Check tasks were created
SELECT COUNT(*) as task_count FROM agent_tasks;
-- Should be > 0 ✅

-- Check logs were recorded
SELECT COUNT(*) as log_count FROM task_logs;
-- Should be > 0 ✅

-- Check results were stored
SELECT COUNT(*) as result_count FROM task_results;
-- Should be > 0 ✅
```

### Full Verification
```sql
-- Get a specific mission's tasks
SELECT title, priority, status FROM agent_tasks 
WHERE mission_id = '[MISSION_ID]'
ORDER BY order_index;

-- Get execution logs for that mission
SELECT action, message, created_at FROM task_logs
WHERE task_id IN (
  SELECT id FROM agent_tasks 
  WHERE mission_id = '[MISSION_ID]'
)
ORDER BY created_at DESC;

-- Get task results
SELECT ai_provider, LENGTH(output) as output_chars 
FROM task_results
WHERE mission_id = '[MISSION_ID]'
ORDER BY created_at DESC;
```

---

## 🛠️ Common Operations

### Check System Health
```sql
SELECT 
  (SELECT COUNT(*) FROM missions) as total_missions,
  (SELECT COUNT(*) FROM agent_tasks) as total_tasks,
  (SELECT COUNT(*) FROM missions WHERE status = 'pending') as pending_missions,
  (SELECT COUNT(*) FROM missions WHERE status = 'in_progress') as running_missions,
  (SELECT COUNT(*) FROM missions WHERE status = 'completed') as completed_missions;
```

### Find Pending Tasks
```sql
SELECT id, title, priority, order_index 
FROM agent_tasks 
WHERE status = 'pending'
ORDER BY priority DESC, order_index ASC;
```

### Check Latest Execution
```sql
SELECT 
  m.title as mission_title,
  m.status as mission_status,
  COUNT(t.id) as task_count,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
  m.updated_at
FROM missions m
LEFT JOIN agent_tasks t ON m.id = t.mission_id
WHERE m.assigned_to = 'operator'
GROUP BY m.id
ORDER BY m.updated_at DESC
LIMIT 5;
```

### Monitor Agent Performance
```sql
SELECT 
  agent_type,
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN action = 'TASK_COMPLETED' THEN 1 END) as completed,
  COUNT(CASE WHEN action = 'TASK_FAILED' THEN 1 END) as failed,
  ROUND(COUNT(CASE WHEN action = 'TASK_COMPLETED' THEN 1 END)::numeric / COUNT(*) * 100, 2) as success_rate
FROM task_logs
WHERE agent_type IS NOT NULL
GROUP BY agent_type;
```

---

## 📝 Key Files to Know

### Code Files
| File | Purpose | Status |
|------|---------|--------|
| `src/agents/operator.ts` | Operator agent with decomposition | ✅ |
| `src/agents/researcher.ts` | Researcher agent (ready for decomposition) | ✅ |
| `src/agents/scribe.ts` | Scribe agent (ready for decomposition) | ✅ |
| `src/inngest/functions/signer-orchestrator.ts` | Main orchestrator | ✅ |
| `src/utils/ai-provider.ts` | AI with fallback chain | ✅ |
| `app/admin/page.tsx` | Admin dashboard | ✅ |
| `app/api/admin/stats/route.ts` | Stats API endpoint | ✅ |

### Migration Files
| File | Status | Size |
|------|--------|------|
| `docs/migrations/001_create_missions_schema.sql` | ✅ Executed | ~100 lines |
| `docs/migrations/002_hierarchical_task_system.sql` | ⏳ Ready | ~100 lines |

### Documentation Files
| File | Purpose | Read Time |
|------|---------|-----------|
| `TASK-DECOMPOSITION-READY.md` | Quick start guide | 5 min |
| `TASK-DECOMPOSITION-SUMMARY.md` | Executive summary | 10 min |
| `TASK-DECOMPOSITION-IMPLEMENTATION.md` | Detailed implementation | 15 min |
| `SYSTEM-ARCHITECTURE-DETAILED.md` | Visual architecture | 10 min |
| `IMPLEMENTATION-CHECKLIST.md` | Step-by-step checklist | 3 min |

---

## ⚠️ Troubleshooting

### "Column priority does not exist"
**Cause:** Migration not yet executed
**Solution:** Execute `/docs/migrations/002_hierarchical_task_system.sql` in Supabase

### "agent_tasks table doesn't exist"
**Cause:** Migration not yet executed
**Solution:** Execute `/docs/migrations/002_hierarchical_task_system.sql` in Supabase

### "Tasks not being created"
**Check:**
1. Migration executed successfully
2. Operator agent is being called (check mission_logs)
3. No errors in task_logs table
4. Check Inngest dashboard for execution errors

### "Admin dashboard not loading"
**Check:**
1. Vercel deployment successful
2. Database connection working
3. Check /api/health endpoint
4. Browser console for errors

### "Performance is slow"
**Check:**
1. Database indexes created (automatic via migration)
2. Run: `SELECT * FROM pg_stat_user_indexes;`
3. Query the largest tables: task_logs, task_results
4. Consider archiving old data if tables grow large

---

## 🚀 Getting Started (Quick)

1. **Execute migration** (right now)
   ```
   Go to: https://app.supabase.com/project/teppzapjhkwoguwlfdvy/sql/new
   Copy: /docs/migrations/002_hierarchical_task_system.sql
   Execute
   ```

2. **Wait for next cycle** (~30 min)
   - Monitor at: https://lore.vercel.app/admin

3. **Verify success**
   ```sql
   SELECT COUNT(*) FROM agent_tasks;
   -- Should see tasks created
   ```

4. **Extend to other agents** (optional, future)
   - Copy decomposition pattern to Researcher and Scribe

---

## 💡 Tips & Tricks

### Monitor in Real-Time
```bash
# Terminal window 1: Watch admin dashboard
open https://lore.vercel.app/admin
# Refresh every 5 seconds

# Terminal window 2: Query database
# Use Supabase console for live queries
```

### Export Mission Data
```sql
-- Export mission results to CSV
SELECT 
  m.id,
  m.title,
  m.priority,
  m.status,
  COUNT(t.id) as task_count,
  m.created_at,
  m.updated_at
FROM missions m
LEFT JOIN agent_tasks t ON m.id = t.mission_id
GROUP BY m.id
ORDER BY m.updated_at DESC;
```

### Track Agent Performance
```sql
-- See which agents are working hardest
SELECT 
  agent_type,
  COUNT(*) as total_tasks,
  AVG(CAST(metadata->>'duration_ms' AS INTEGER)) as avg_duration_ms
FROM task_results
WHERE metadata->>'duration_ms' IS NOT NULL
GROUP BY agent_type;
```

---

## 🎓 Learning Resources

### Understand the System
1. Start with: `TASK-DECOMPOSITION-READY.md`
2. Then read: `TASK-DECOMPOSITION-SUMMARY.md`
3. Deep dive: `TASK-DECOMPOSITION-IMPLEMENTATION.md`
4. Visual reference: `SYSTEM-ARCHITECTURE-DETAILED.md`

### Understand the Code
1. Look at: `src/agents/operator.ts` (decomposeMissionIntoTasks function)
2. Look at: `src/agents/operator.ts` (executeTask function)
3. Reference: `src/inngest/functions/signer-orchestrator.ts` (orchestration)

### Understand the Database
1. Schema: `docs/migrations/002_hierarchical_task_system.sql`
2. Relationships: Task → Task Logs → Task Results
3. Hierarchy: Mission → Tasks → (optional) Subtasks

---

## 🔗 Important URLs

| Resource | URL |
|----------|-----|
| **Admin Dashboard** | https://lore.vercel.app/admin |
| **Supabase Console** | https://app.supabase.com/project/teppzapjhkwoguwlfdvy/editor |
| **SQL Editor** | https://app.supabase.com/project/teppzapjhkwoguwlfdvy/sql/new |
| **GitHub Repo** | https://github.com/NonceSyndicate/Lore |
| **Inngest Dashboard** | https://app.inngest.com/ |
| **Vercel Dashboard** | https://vercel.com/dashboard |

---

## ✨ Summary

Your autonomous mission system is **production-ready with task decomposition**.

**Current state:**
- ✅ Code implemented and deployed
- ✅ 47 missions queued
- ✅ AI agents ready
- ⏳ Database migration pending (your action)

**What to do:**
1. Execute the SQL migration (2 minutes)
2. Watch the system work (next 30 minutes)
3. Monitor via admin dashboard (ongoing)

**What you'll get:**
- ✅ Missions broken into 3-7 granular tasks
- ✅ Each task executed independently with AI
- ✅ Full audit trail in database
- ✅ Real-time progress tracking
- ✅ Complete execution visibility

**The system is ready. Execute that migration and watch it go! 🚀**
