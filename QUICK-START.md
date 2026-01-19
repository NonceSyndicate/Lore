# ⚡ Quick Start: Seed Epic Missions in 5 Minutes

## 1️⃣ Prerequisites Check (30 seconds)

```bash
# Verify you're in the right directory
cd /workspaces/Lore && ls -la | grep "package.json"

# Check Node.js version
node --version  # Should be 18+

# Check environment variables
echo "URL: $SUPABASE_URL"
echo "KEY: ${SUPABASE_ANON_KEY:0:10}..."  # Should show first 10 chars
```

**All set?** ✅ Continue to step 2

**Missing env vars?** Set them:
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-public-key-here"
```

---

## 2️⃣ Database Schema Ready? (1 minute)

```bash
# Quick check - run in Supabase SQL Editor
# https://app.supabase.com/project/[your-project]/sql/new

# Paste this:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('missions', 'mission_logs', 'signer_context', 'mission_results');
```

**Expected output:**
```
table_name
-----------
missions
mission_logs
signer_context
mission_results
```

**If missing?** Run migration first:
```bash
# 1. Copy contents of: docs/migrations/001_create_missions_schema.sql
# 2. Go to Supabase SQL Editor
# 3. Create new query
# 4. Paste migration
# 5. Execute
# 6. Come back here
```

---

## 3️⃣ Run Seed Script (2 minutes)

```bash
# Make sure you're in workspace root
cd /workspaces/Lore

# Run the seed script
npx ts-node src/scripts/seed-epic-missions.ts
```

**Output should look like:**
```
🚀 SEEDING EPIC MISSIONS - THE NONCE SYNDICATE MASTER PLAN

════════════════════════════════════════════════════════════════════════════════

📋 Inserting 47 EPIC missions...

✅ Successfully inserted 47 EPIC missions!

════════════════════════════════════════════════════════════════════════════════

🎯 MISSION DISTRIBUTION BY PILLAR:

   Landing Page: 8 missions
   Agent Development: 14 missions
   Twitter Bot: 12 missions
   Tools & Ecosystem: 13 missions

💰 TOTAL BUDGET: $1,950

📊 BY PRIORITY:

   CRITICAL: 4 missions
   HIGH: 13 missions
   MEDIUM: 21 missions
   LOW: 9 missions

════════════════════════════════════════════════════════════════════════════════

🔥 EPIC MISSION PLAN ACTIVATED!
```

**Success?** ✅ Jump to step 4

**Error?** See troubleshooting below

---

## 4️⃣ Verify in Supabase (1 minute)

```bash
# Quick verification query
# Go to Supabase SQL Editor and run:

SELECT COUNT(*) as total_missions,
       COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical,
       COUNT(CASE WHEN priority = 'high' THEN 1 END) as high,
       COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium,
       COUNT(CASE WHEN priority = 'low' THEN 1 END) as low
FROM missions
WHERE created_by = 'epic-seed';
```

**Expected output:**
```
total_missions | critical | high | medium | low
47             | 4        | 13   | 21     | 9
```

✅ **Perfect! Missions are seeded!**

---

## 5️⃣ What's Next? (Optional - 30 seconds)

### Immediate Next Steps:

1. **Review Mission Status**
   ```bash
   # In Supabase Table Editor:
   # Go to: missions table
   # Filter: created_by = 'epic-seed'
   # Sort by: priority DESC
   ```

2. **Trigger First Mission Execution**
   - Go to [Inngest Dashboard](https://inngest.com)
   - Find `signer/orchestrator` function
   - Click "Run"
   - Monitor execution logs

3. **Monitor Dashboard**
   - [Supabase Missions Table](https://app.supabase.com)
   - [Inngest Dashboard](https://inngest.com)
   - Terminal: `npm run dev` to start local server

---

## 🆘 Troubleshooting

### Error: "SUPABASE_URL is not defined"

**Solution:**
```bash
# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-public-key"

# Verify they're set
echo $SUPABASE_URL

# Run again
npx ts-node src/scripts/seed-epic-missions.ts
```

### Error: "relation 'missions' does not exist"

**Solution:**
```bash
# The migration hasn't been run yet

# 1. Go to Supabase SQL Editor
# https://app.supabase.com/project/[your-project]/sql/new

# 2. Copy & paste the migration:
# docs/migrations/001_create_missions_schema.sql

# 3. Execute the query

# 4. Run seed script again
npx ts-node src/scripts/seed-epic-missions.ts
```

### Error: "Cannot find module '@supabase/supabase-js'"

**Solution:**
```bash
# Dependencies aren't installed

# Install them
npm install

# Run again
npx ts-node src/scripts/seed-epic-missions.ts
```

### Script runs but says "Found X existing epic missions"

**Solution - Option A: Add to existing missions**
```bash
# Just run again - it will skip duplicates
npx ts-node src/scripts/seed-epic-missions.ts
```

**Solution - Option B: Start fresh**
```bash
# Delete existing epic missions and re-seed

# In Supabase SQL Editor, run:
DELETE FROM missions WHERE created_by = 'epic-seed';

# Then run seed script
npx ts-node src/scripts/seed-epic-missions.ts
```

### Script hangs or times out

**Solution:**
```bash
# If script seems stuck for >30 seconds, it may be waiting for Supabase

# Try with increased timeout
timeout 60 npx ts-node src/scripts/seed-epic-missions.ts

# Or check Supabase connection
# 1. Go to Supabase dashboard
# 2. Check project status
# 3. Verify no active deployments
# 4. Try again
```

---

## 📊 Quick Status Queries

### Check Missions by Priority

```sql
SELECT priority, COUNT(*) 
FROM missions WHERE created_by = 'epic-seed'
GROUP BY priority
ORDER BY CASE priority 
  WHEN 'critical' THEN 1 
  WHEN 'high' THEN 2 
  WHEN 'medium' THEN 3 
  ELSE 4 END;
```

### Check Missions by Assigned Agent

```sql
SELECT assigned_to, COUNT(*) 
FROM missions WHERE created_by = 'epic-seed'
GROUP BY assigned_to;
```

### Check Total Budget

```sql
SELECT SUM((context->>'budget_limit_usd')::int) as total_budget
FROM missions WHERE created_by = 'epic-seed';
```

### View Specific Mission

```sql
SELECT 
  title, 
  priority, 
  assigned_to,
  context->>'objectives' as objectives,
  (context->>'budget_limit_usd')::int as budget
FROM missions 
WHERE title ILIKE '%landing page%'
AND created_by = 'epic-seed';
```

---

## 🎯 You're Ready!

**Missions seeded:** ✅ 47/47  
**Infrastructure:** ✅ Online  
**Signer ready:** ✅ Awaiting command  
**Agents ready:** ✅ Standing by  

### Next Phase: Execute Missions

```bash
# Option 1: Manual trigger (development)
curl http://localhost:3000/api/inngest \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"event":{"name":"signer/orchestrator"}}'

# Option 2: Automatic (30 min cycles - production)
# Wait for Signer Orchestrator schedule to trigger

# Monitor progress
# Dashboard: https://yourapp.vercel.app/api/health
# Logs: Supabase mission_logs table
# Events: Inngest dashboard
```

### Recommended Reading

- 📖 [Seed Guide Details](./SEED-EPIC-MISSIONS.md) - Full documentation
- 🗂️ [Mission Plan](./EPIC-MISSION-PLAN.md) - Complete mission specs
- ✅ [Execution Checklist](./EXECUTION-CHECKLIST.md) - Step-by-step guide
- 🛠️ [Setup Guide](./setup-guide.md) - System architecture

---

## 🚀 THE NONCE SYNDICATE IS LIVE!

You now have:
- ✅ 47 comprehensive missions
- ✅ 4 strategic pillars
- ✅ Autonomous agent framework
- ✅ Real-time mission tracking
- ✅ Multi-channel execution

**Time to conquer the 30-day challenge and hit $50K presale! 🎯**

Questions? Check the full documentation or review the Inngest logs.
