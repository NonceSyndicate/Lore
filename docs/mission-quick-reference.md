# Mission System Quick Reference

## 🚀 Quick Start

### 1. Apply Database Migration
```bash
# Copy contents of docs/migrations/001_create_missions_schema.sql
# Paste into Supabase SQL Editor and execute
```

### 2. Seed Test Missions
```bash
npx ts-node src/scripts/seed-missions.ts
```

### 3. Monitor Execution
- Inngest: `https://app.inngest.com/env/production/functions/signer-orchestrator`
- Logs: Check `mission_logs` table in Supabase
- Dashboard: (coming in step 4)

---

## 📋 Key Tables

| Table | Purpose | Records |
|-------|---------|---------|
| `missions` | Mission queue and status | Active missions |
| `signer_context` | Conversation history per mission | Full execution history |
| `mission_results` | Final outcomes and metrics | Completed missions |
| `mission_logs` | Detailed execution logs | All logs (DEBUG/INFO/WARN/ERROR) |

---

## 🎯 Views

| View | Purpose | Use |
|------|---------|-----|
| `mission_summary` | All mission details with log count | Dashboard display |
| `mission_stats` | Stats by agent type and status | Analytics |

---

## 💾 Common Queries

### Get Next Mission to Execute
```sql
SELECT * FROM missions
WHERE status = 'pending' AND assigned_to = 'signer'
ORDER BY priority DESC, created_at ASC
LIMIT 1;
```

### View Mission Status
```sql
SELECT id, title, priority, status, started_at, completed_at
FROM missions
ORDER BY created_at DESC
LIMIT 20;
```

### See Mission Logs
```sql
SELECT level, message, context, created_at
FROM mission_logs
WHERE mission_id = '<MISSION_ID>'
ORDER BY created_at DESC;
```

### Get Metrics
```sql
SELECT * FROM mission_stats;
```

### Find Failed Missions
```sql
SELECT * FROM missions
WHERE status = 'failed'
ORDER BY started_at DESC;
```

---

## 🔧 Mission Status Flow

```
PENDING → IN_PROGRESS → (COMPLETED | FAILED)
   ↑                          ↓
   └──────── RETRY ───────────┘
```

---

## 📊 Mission Priorities

```
🔴 CRITICAL: System outages, security (immediate)
🟠 HIGH:     Major features, deployments (< 1 hour)
🟡 MEDIUM:   Regular operations (< 24 hours)
🟢 LOW:      Cleanup, nice-to-have (as available)
```

---

## 🛠️ Manual Actions

### Mark Mission as Complete
```sql
UPDATE missions
SET status = 'completed', completed_at = now()
WHERE id = '<MISSION_ID>';

INSERT INTO mission_results (mission_id, outcome, results, cost_usd)
VALUES ('<MISSION_ID>', 'success', '{}', 0);
```

### Retry Failed Mission
```sql
UPDATE missions
SET status = 'pending', started_at = NULL
WHERE id = '<MISSION_ID>';
```

### Create New Mission
```sql
INSERT INTO missions (title, description, priority, context, assigned_to)
VALUES (
  'New Task',
  'What needs to be done',
  'high',
  '{"objectives": ["do X", "do Y"], "tools_available": ["tool1"], "budget_limit_usd": 5, "autonomous": true}'::jsonb,
  'signer'
) RETURNING *;
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `docs/migrations/001_create_missions_schema.sql` | Database setup |
| `docs/mission-system-setup.md` | Full setup guide |
| `src/types/missions.ts` | TypeScript types |
| `src/scripts/seed-missions.ts` | Seed script |
| `src/inngest/functions/signer-orchestrator.ts` | Orchestrator logic |

---

## ⚡ Performance Tips

1. **Use indices**: Queries filter by `status`, `priority`, `assigned_to`
2. **Archive old missions**: Keep table size manageable
3. **Monitor logs**: Set retention policy on `mission_logs`
4. **Use views**: Avoid complex joins in applications

---

## 🐛 Debugging

### Check if orchestrator is running
```sql
SELECT COUNT(*) as run_count
FROM mission_logs
WHERE created_at > now() - interval '1 hour';
-- Should see logs from recent runs
```

### Check for stuck missions
```sql
SELECT * FROM missions
WHERE status = 'in_progress'
AND started_at < now() - interval '2 hours';
```

### View recent errors
```sql
SELECT level, message, created_at
FROM mission_logs
WHERE level IN ('ERROR', 'WARN')
ORDER BY created_at DESC
LIMIT 20;
```

---

## 📞 Support

| Issue | Solution |
|-------|----------|
| No missions running | Check `missions` table - ensure `status = 'pending'` |
| Stuck missions | Check `mission_logs` for errors, then retry |
| High errors | View error logs, check Inngest dashboard |
| Database slow | Check indices, review `pg_stat_user_indexes` |

---

## 🎓 Next Steps After Setup

1. **Implement wallet operations** in signer-orchestrator.ts
2. **Add mission logging** throughout execution
3. **Build monitoring dashboard** for mission status
4. **Create API endpoints** for mission management
5. **Set up alerts** for failed missions

See `docs/mission-system-setup.md` for detailed instructions.
