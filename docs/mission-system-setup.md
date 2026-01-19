# Autonomous Mission System Setup Guide

## Overview

The Mission System enables autonomous agents to execute coordinated tasks through a centralized queue. The **Signer Orchestrator** coordinates mission execution on a 30-minute schedule, ensuring continuous autonomous operation.

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Signer Orchestrator (30 min)            │
├─────────────────────────────────────────────────┤
│ 1. Fetch next pending mission                   │
│ 2. Mark as in_progress                          │
│ 3. Prepare context (conversation history)       │
│ 4. Log mission briefing                         │
│ 5. Trigger execution (manual or auto)           │
└─────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────┐
│  Supabase Missions Schema                       │
├─────────────────────────────────────────────────┤
│ • missions                                       │
│ • signer_context (conversation history)         │
│ • mission_results (outcomes)                    │
│ • mission_logs (detailed logs)                  │
└─────────────────────────────────────────────────┘
```

## Setup Steps

### Step 1: Apply Database Migration

In Supabase Dashboard:

1. Go to **SQL Editor**
2. Create new query
3. Copy contents of `docs/migrations/001_create_missions_schema.sql`
4. Execute

**Verifies:**
- ✅ All tables created
- ✅ Indices created for performance
- ✅ Views created for monitoring
- ✅ Constraints in place

### Step 2: Seed Test Missions

```bash
# Install dependencies (if needed)
npm install

# Run seed script
npx ts-node src/scripts/seed-missions.ts
```

**Output:**
```
🌱 Starting mission seeding...

📨 Inserting 10 test missions...

✅ Successfully inserted 10 missions:

1. 🎯 System Health Audit
   Priority: HIGH
   Assigned to: signer
   Objectives: 5
   ID: 550e8400-e29b-41d4-a716-446655440000
...
```

### Step 3: Verify in Supabase

Check the **missions** table:

```sql
-- View all missions
SELECT id, title, priority, status, assigned_to, created_at 
FROM missions 
ORDER BY priority DESC, created_at DESC;

-- View mission stats
SELECT * FROM mission_stats;

-- View mission summary
SELECT * FROM mission_summary;
```

### Step 4: Monitor Orchestrator

1. Deploy code changes
2. Watch Inngest dashboard: `https://app.inngest.com`
3. Look for `signer-orchestrator` function runs
4. Check logs in Supabase `mission_logs` table

## Mission Priority System

| Priority | Use Case | Response Time |
|----------|----------|-----------------|
| **Critical** | System down, security issue | Immediate |
| **High** | Major feature, important fix | < 1 hour |
| **Medium** | Normal operations, optimizations | < 24 hours |
| **Low** | Nice-to-have, cleanup | As available |

## Mission Lifecycle

```
1. PENDING
   ├─ Waiting in queue
   └─ Selected by Signer Orchestrator

2. IN_PROGRESS
   ├─ Marked at orchestrator start
   ├─ Signer executes tasks
   └─ Context stored

3. COMPLETED or FAILED
   ├─ Results recorded
   ├─ Performance metrics stored
   └─ Next mission selected
```

## Create Custom Missions

### Via TypeScript

```typescript
import { supabase } from '@/src/inngest/client';
import { CreateMissionInput } from '@/src/types/missions';

const newMission: CreateMissionInput = {
  title: 'Custom Analysis Task',
  description: 'Analyze market conditions and opportunities',
  priority: 'high',
  context: {
    objectives: [
      'Scan for opportunities',
      'Analyze market trends',
      'Generate report',
    ],
    tools_available: ['API', 'Database'],
    budget_limit_usd: 5,
    autonomous: true,
  },
  assigned_to: 'researcher',
  tags: ['custom', 'analysis'],
};

const { data, error } = await supabase
  .from('missions')
  .insert(newMission)
  .select()
  .single();
```

### Via Supabase Dashboard

1. Go to **missions** table
2. Click **Insert row**
3. Fill in fields:
   - `title`: Mission name
   - `description`: What needs to be done
   - `priority`: low/medium/high/critical
   - `status`: pending (default)
   - `context`: JSON with objectives, tools, budget
   - `assigned_to`: signer/operator/researcher/scribe

4. Click **Save**

### Via API (Future)

```bash
curl -X POST https://your-app.vercel.app/api/missions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Mission",
    "description": "Mission description",
    "priority": "high",
    "context": {...}
  }'
```

## Query Mission Status

### Get Next Pending Mission

```sql
SELECT * FROM missions
WHERE status = 'pending'
  AND assigned_to = 'signer'
ORDER BY priority DESC, created_at ASC
LIMIT 1;
```

### Get Mission Statistics

```sql
SELECT * FROM mission_stats;
-- Shows count by status and agent type
```

### View Mission Logs

```sql
SELECT * FROM mission_logs
WHERE mission_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY created_at DESC;
```

### Get Completed Missions with Results

```sql
SELECT 
  m.id, m.title, m.priority,
  mr.outcome, mr.execution_time_seconds,
  mr.cost_usd, mr.summary
FROM missions m
LEFT JOIN mission_results mr ON m.id = mr.mission_id
WHERE m.status = 'completed'
ORDER BY m.completed_at DESC
LIMIT 20;
```

## Monitoring & Debugging

### Check Signer Orchestrator Status

1. Open Inngest Dashboard
2. Find `signer-orchestrator` function
3. View recent runs:
   - **Success**: Mission queued for execution
   - **Failure**: Check error logs
   - **No runs**: Check if function is enabled

### Common Issues

#### No missions being picked up
```sql
-- Check if pending missions exist
SELECT COUNT(*) FROM missions WHERE status = 'pending';

-- Check if they're assigned to signer
SELECT COUNT(*) FROM missions 
WHERE status = 'pending' AND assigned_to = 'signer';
```

#### Missions stuck in progress
```sql
-- Find stuck missions (in_progress for > 1 hour)
SELECT * FROM missions
WHERE status = 'in_progress'
AND started_at < now() - interval '1 hour';

-- Mark as failed and retry
UPDATE missions
SET status = 'pending', started_at = NULL
WHERE id = '...';
```

#### High error rate
```sql
-- Check recent errors
SELECT level, message, context, created_at
FROM mission_logs
WHERE level = 'ERROR'
  AND created_at > now() - interval '1 hour'
ORDER BY created_at DESC;
```

## Performance Optimization

### Add Caching

Missions that complete successfully should be archived:

```sql
-- Archive old completed missions (over 30 days)
UPDATE missions
SET status = 'archived'
WHERE status = 'completed'
  AND completed_at < now() - interval '30 days';
```

### Monitor Database

```sql
-- Check index usage
SELECT * FROM pg_stat_user_indexes
WHERE schemaname = 'public';

-- Check table size
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Next Steps

1. ✅ **Apply migration** - Run SQL in Supabase
2. ✅ **Seed missions** - Run seed script
3. ✅ **Monitor execution** - Watch Inngest logs
4. 🔄 **Implement wallet operations** - Add to signer-orchestrator
5. 🔄 **Add logging** - Log to mission_logs table
6. 🔄 **Build dashboard** - Display mission status UI

## Support & Troubleshooting

- Check `mission_logs` table for detailed error messages
- View Inngest dashboard for orchestrator status
- Review Supabase logs for database errors
- Check deployment logs in Vercel for initialization errors

---

For questions or issues, check the mission system logs in Supabase:

```sql
SELECT * FROM mission_logs
WHERE created_at > now() - interval '1 hour'
ORDER BY created_at DESC;
```
