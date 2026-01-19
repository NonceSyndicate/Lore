# 🎯 Epic Mission Implementation Checklist

## Pre-Seeding Checklist

- [ ] Database schema migrated
  - [ ] Check Supabase SQL Editor
  - [ ] Run: `docs/migrations/001_create_missions_schema.sql`
  - [ ] Verify: `missions` table exists with all columns
  - [ ] Verify: `mission_logs` table exists
  - [ ] Verify: `signer_context` table exists
  - [ ] Verify: `mission_results` table exists

- [ ] Environment variables configured
  - [ ] `SUPABASE_URL` set to project URL
  - [ ] `SUPABASE_ANON_KEY` set to public key
  - [ ] Test: `echo $SUPABASE_URL`

- [ ] Dependencies installed
  - [ ] Run: `npm install`
  - [ ] Check: TypeScript compiler works
  - [ ] Check: ts-node available

---

## Seeding Phase

### Option A: Automated Script (Recommended)

```bash
# 1. Navigate to workspace
cd /workspaces/Lore

# 2. Run seed script
npx ts-node src/scripts/seed-epic-missions.ts

# 3. Expected output
# ✅ Successfully inserted 47 EPIC missions!
```

**Checklist:**
- [ ] Script executes without errors
- [ ] Output shows 47 missions inserted
- [ ] Budget total shows ~$1,950
- [ ] Priority distribution visible

### Option B: Manual SQL (If Script Fails)

```bash
# 1. Open Supabase SQL Editor
# Go to: https://app.supabase.com/project/[project]/sql/new

# 2. Copy mission inserts from:
# docs/MANUAL-SQL-INSERTS.md

# 3. Execute queries
# Note: This may take 2-3 minutes for 47 missions

# 4. Verify
SELECT COUNT(*) FROM missions WHERE created_by = 'epic-seed';
-- Should return: 47
```

---

## Post-Seeding Verification

### Database Checks

- [ ] **Total Mission Count**
  ```sql
  SELECT COUNT(*) FROM missions WHERE created_by = 'epic-seed';
  ```
  Expected: 47

- [ ] **By Pillar Distribution**
  ```sql
  SELECT priority, COUNT(*) FROM missions 
  WHERE created_by = 'epic-seed'
  GROUP BY priority;
  ```
  Expected:
  - critical: 4
  - high: 13
  - medium: 21
  - low: 9

- [ ] **Budget Total**
  ```sql
  SELECT SUM((context->>'budget_limit_usd')::int) 
  FROM missions WHERE created_by = 'epic-seed';
  ```
  Expected: ~1950

- [ ] **Sample Mission Retrieval**
  ```sql
  SELECT title, priority, status, assigned_to 
  FROM missions 
  WHERE created_by = 'epic-seed' 
  LIMIT 5;
  ```

- [ ] **Verify Tags**
  ```sql
  SELECT DISTINCT tags FROM missions 
  WHERE created_by = 'epic-seed' LIMIT 10;
  ```

- [ ] **Check Contexts**
  ```sql
  SELECT title, context->>'budget_limit_usd' 
  FROM missions 
  WHERE created_by = 'epic-seed' 
  LIMIT 5;
  ```

### Supabase Dashboard Checks

- [ ] Navigate to [Supabase Dashboard](https://app.supabase.com)
- [ ] Select project
- [ ] Go to **Table Editor**
- [ ] Click **missions** table
- [ ] Verify all 47 rows visible
- [ ] Check **created_by** column shows 'epic-seed' for all
- [ ] Check **status** column shows 'pending' for all
- [ ] Spot-check 2-3 missions:
  - [ ] Click on mission row
  - [ ] Verify **context** JSON is valid
  - [ ] Verify **metadata** JSON is valid
  - [ ] Verify **tags** array is populated

---

## Agent Preparation

### Signer Orchestrator Setup

- [ ] Review `src/inngest/functions/signer-orchestrator.ts`
- [ ] Verify wallet initialization code
- [ ] Check environment variables:
  - [ ] `WALLET_PRIVATE_KEY` set (secure!)
  - [ ] `ETHERS_PROVIDER_URL` set
  - [ ] `INNGEST_EVENT_KEY` set
- [ ] Test: Fetch a mission manually
  ```typescript
  const { data } = await supabase
    .from('missions')
    .select('*')
    .eq('status', 'pending')
    .limit(1);
  console.log(data);
  ```

### Operator Agent Setup

- [ ] Review `src/inngest/functions/operator-functions.ts`
- [ ] Verify GitHub API token (for branch creation)
  - [ ] `GITHUB_TOKEN` set in environment
  - [ ] Token has `repo` and `workflow` permissions
- [ ] Test: Create test branch
  ```bash
  curl -H "Authorization: token $GITHUB_TOKEN" \
    https://api.github.com/repos/[owner]/[repo]/git/refs \
    -d '{"ref":"refs/heads/test-branch","sha":"main"}'
  ```

### Researcher Agent Setup

- [ ] Review `src/inngest/functions/researcher-functions.ts`
- [ ] Setup analytics connections:
  - [ ] Google Analytics API credentials
  - [ ] Twitter API credentials
- [ ] Test: Fetch simple metric
  ```bash
  curl https://api.twitter.com/2/tweets \
    -H "Authorization: Bearer $TWITTER_BEARER_TOKEN"
  ```

### Scribe Agent Setup

- [ ] Review `src/inngest/functions/scribe-functions.ts`
- [ ] Setup email credentials:
  - [ ] `EMAIL_SERVICE_API_KEY` set
  - [ ] Email templates created in service
- [ ] Setup content generation:
  - [ ] `OPENAI_API_KEY` set (or alternative)
- [ ] Test: Generate sample tweet
  ```bash
  curl https://api.openai.com/v1/chat/completions \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{"messages":[{"role":"user","content":"Tweet about growth"}]}'
  ```

---

## Mission Execution Pipeline

### First Cycle (Manual Trigger)

- [ ] **Inngest Dashboard**
  - [ ] Go to [Inngest Dashboard](https://inngest.com)
  - [ ] Select your function
  - [ ] Click "Run"
  - [ ] Select `signer/orchestrator`
  - [ ] Execute

- [ ] **Monitor Execution**
  - [ ] Watch Inngest logs for:
    - [ ] Mission fetched
    - [ ] Agent assigned
    - [ ] Function queued
    - [ ] Results logged
  - [ ] Check Supabase for updates:
    ```sql
    SELECT * FROM missions 
    WHERE status != 'pending' 
    LIMIT 5;
    ```
  - [ ] Check mission logs:
    ```sql
    SELECT * FROM mission_logs 
    WHERE created_at > NOW() - INTERVAL '5 minutes' 
    LIMIT 10;
    ```

- [ ] **Verify First Result**
  - [ ] [ ] Mission status changed from 'pending' to 'in_progress' or 'completed'
  - [ ] [ ] mission_results table has entry
  - [ ] [ ] mission_logs table has entries
  - [ ] [ ] No errors in Inngest logs

### Scheduled Execution

- [ ] **Enable 30-Minute Schedule**
  - [ ] Check `src/inngest/functions/signer-orchestrator.ts`
  - [ ] Verify: `every('30 minutes')` configured
  - [ ] Verify: Schedule runs from start time

- [ ] **Monitor for 24 Hours**
  - [ ] Check Inngest dashboard every hour
  - [ ] Verify missions completing
  - [ ] Track: missions_completed / missions_pending
  - [ ] Monitor: average execution time
  - [ ] Watch for: any failures or errors

- [ ] **Health Check Endpoint**
  - [ ] Test: `curl http://localhost:3000/api/health`
  - [ ] Expected response:
    ```json
    {
      "status": "healthy",
      "checks": {
        "database": "ok",
        "supabase": "ok",
        "inngest": "ok"
      }
    }
    ```

---

## Phase 1: Critical Missions (Days 1-3)

### Landing Page Pillar

- [ ] **CRITICAL: Design Presale Landing Page**
  - [ ] Status: pending → in_progress
  - [ ] Assign to: Signer
  - [ ] Expected output: Landing page URL
  - [ ] Success: Deployed on Vercel
  - [ ] Verify: Can visit URL and see form

- [ ] **HIGH: Set Up Email Campaign Infrastructure**
  - [ ] Status: pending → in_progress
  - [ ] Assign to: Scribe
  - [ ] Expected output: Email service configured
  - [ ] Success: Can send test email
  - [ ] Verify: Check email deliverability

- [ ] **HIGH: Create Presale Offer & Pricing Strategy**
  - [ ] Status: pending → in_progress
  - [ ] Assign to: Signer
  - [ ] Expected output: Pricing doc created
  - [ ] Success: 3-5 presale tiers defined
  - [ ] Verify: Pricing documented in Supabase

- [ ] **HIGH: Implement Analytics & Tracking**
  - [ ] Status: pending → in_progress
  - [ ] Assign to: Operator
  - [ ] Expected output: GA4 dashboard linked
  - [ ] Success: Can see initial page views
  - [ ] Verify: Google Analytics API working

### Agent Development Pillar

- [ ] **CRITICAL: Feature Branch Strategy**
  - [ ] Status: pending → in_progress
  - [ ] Assign to: Operator
  - [ ] Expected output: GitHub protection rules enabled
  - [ ] Success: Branch creation follows pattern
  - [ ] Verify: Try creating feature/test-mission branch

- [ ] **CRITICAL: CI/CD Auto-Merge Pipeline**
  - [ ] Status: pending → in_progress
  - [ ] Assign to: Operator
  - [ ] Expected output: GitHub Actions workflow created
  - [ ] Success: Auto-merge on test pass
  - [ ] Verify: Submit test PR and watch it auto-merge

- [ ] **HIGH: Automated Testing Suite**
  - [ ] Status: pending → in_progress
  - [ ] Assign to: Operator
  - [ ] Expected output: Jest tests created
  - [ ] Success: 80%+ coverage achieved
  - [ ] Verify: `npm test` shows coverage report

- [ ] **HIGH: Agent Code Generation Framework**
  - [ ] Status: pending → in_progress
  - [ ] Assign to: Signer
  - [ ] Expected output: Templates created
  - [ ] Success: Can scaffold new agent
  - [ ] Verify: `npm run scaffold-agent` works

### Twitter Bot Pillar

- [ ] **CRITICAL: Twitter/X API Integration**
  - [ ] Status: pending → in_progress
  - [ ] Assign to: Operator
  - [ ] Expected output: API credentials configured
  - [ ] Success: Can fetch tweets
  - [ ] Verify: Test API call in Inngest

### Ecosystem Tools Pillar

- [ ] **CRITICAL: Agent Template Library**
  - [ ] Status: pending → in_progress
  - [ ] Assign to: Operator
  - [ ] Expected output: Templates in repo
  - [ ] Success: 5+ templates available
  - [ ] Verify: Clone template and verify it works

---

## Deployment Checklist

### Pre-Deployment

- [ ] All critical missions in progress or completed
- [ ] No TypeScript errors: `npm run build`
- [ ] All tests passing: `npm test`
- [ ] Environment variables all set
- [ ] Database migrations applied
- [ ] Secrets configured in Vercel

### Deployment Steps

```bash
# 1. Build locally
npm run build

# 2. Run tests
npm test

# 3. Deploy to staging (optional)
vercel --prod --scope staging

# 4. Run smoke tests on staging
curl https://staging.yourapp.vercel.app/api/health

# 5. Deploy to production
vercel --prod

# 6. Verify production
curl https://yourapp.vercel.app/api/health
```

Checklist:
- [ ] Build successful
- [ ] All tests pass
- [ ] Staging deployment successful
- [ ] Staging health check passes
- [ ] Production deployment successful
- [ ] Production health check passes
- [ ] Monitor Inngest for first production mission

### Post-Deployment

- [ ] Monitor Inngest dashboard for 30 minutes
- [ ] Check Supabase logs for errors
- [ ] Verify missions executing
- [ ] Check email delivery working
- [ ] Test Twitter API calls
- [ ] Monitor error rates

---

## Monitoring & Metrics

### Daily Checks

- [ ] [ ] Morning: Check overnight mission execution
  ```bash
  # SQL query
  SELECT COUNT(*) as completed
  FROM missions
  WHERE status = 'completed'
  AND updated_at > NOW() - INTERVAL '24 hours';
  ```

- [ ] [ ] Afternoon: Review mission logs for errors
  ```bash
  # SQL query
  SELECT * FROM mission_logs
  WHERE level = 'ERROR'
  AND created_at > NOW() - INTERVAL '24 hours';
  ```

- [ ] [ ] Evening: Check resource usage
  ```bash
  # Inngest dashboard: Monitor function invocations
  # Vercel dashboard: Monitor build minutes, memory usage
  # Supabase dashboard: Monitor database size, connections
  ```

### Weekly Review

- [ ] [ ] Count completed missions: TARGET = 20+
- [ ] [ ] Average execution time: TARGET = <5 minutes
- [ ] [ ] Success rate: TARGET = >95%
- [ ] [ ] Email signups: TARGET = 500+
- [ ] [ ] Twitter followers: TARGET = 100+
- [ ] [ ] Presale revenue: TARGET = $1,000+

### Troubleshooting

**Problem: Missions not executing**
- [ ] Check Inngest logs for errors
- [ ] Verify Supabase connectivity
- [ ] Check function deployment
- [ ] Review mission status in database

**Problem: Slow execution**
- [ ] Check database query times
- [ ] Review function timeout settings
- [ ] Check external API response times
- [ ] Optimize queries if needed

**Problem: High failure rate**
- [ ] Review error logs in mission_logs
- [ ] Check external service status
- [ ] Verify API credentials
- [ ] Review agent implementation

---

## Go/No-Go Decision Points

### Day 1 - Infrastructure Ready?

- [ ] Landing page deployed: **YES / NO**
- [ ] Email system working: **YES / NO**
- [ ] GitHub CI/CD automated: **YES / NO**
- [ ] Twitter API connected: **YES / NO**

**Decision: GO → Proceed to Phase 2 | NO-GO → Fix issues before proceeding**

### Day 5 - Revenue Pipeline Active?

- [ ] Email list: 1,000+ signups: **YES / NO**
- [ ] Analytics tracking: **YES / NO**
- [ ] Presale offers: 50+ conversions: **YES / NO**
- [ ] Twitter automation: Posting 24/7: **YES / NO**

**Decision: GO → Proceed to Phase 3 | NO-GO → Debug and re-run Phase 2**

### Day 15 - Scaling in Effect?

- [ ] Email list: 5,000+ signups: **YES / NO**
- [ ] Twitter followers: 500+: **YES / NO**
- [ ] Presale revenue: $5,000+: **YES / NO**
- [ ] Agents autonomously completing: **YES / NO**

**Decision: GO → Accelerate Phase 4 | NO-GO → Focus on missing components**

### Day 30 - Mission Accomplished?

- [ ] Email list: 10,000+ signups: **YES / NO**
- [ ] Twitter followers: 5,000+: **YES / NO**
- [ ] Presale revenue: $50,000+: **YES / NO**
- [ ] Platform stable 99.9%: **YES / NO**

**Decision: SUCCESS → Launch Phase 2 | PARTIAL → Plan optimization**

---

## Rollback Plan

### If Critical Issues Arise

1. **Pause Mission Execution**
   ```bash
   # Disable Signer Orchestrator schedule
   # In src/inngest/functions/signer-orchestrator.ts
   # Change: every('30 minutes')
   # To: manual trigger only
   ```

2. **Check Recent Changes**
   ```bash
   git log --oneline -10
   git diff HEAD~1 HEAD
   ```

3. **Revert to Last Known Good**
   ```bash
   git revert HEAD
   npm run build
   vercel --prod
   ```

4. **Verify Stability**
   ```bash
   curl https://yourapp.vercel.app/api/health
   ```

5. **Resume Carefully**
   - Re-enable with manual triggers first
   - Run single mission to verify
   - Monitor closely before resuming schedule

---

## Success Criteria

### Phase 1 (Days 1-5): Foundation
- ✅ All 4 CRITICAL missions completed
- ✅ Zero deployment errors
- ✅ 1,000+ email signups
- ✅ Landing page live with analytics
- ✅ CI/CD auto-merge functioning

### Phase 2 (Days 6-15): Traction  
- ✅ 20+ missions completed
- ✅ 5,000+ email signups
- ✅ 500+ Twitter followers
- ✅ $5,000+ presale revenue
- ✅ Autonomous agent execution

### Phase 3 (Days 16-25): Scale
- ✅ 40+ missions completed
- ✅ Ecosystem tools available
- ✅ Community forum active
- ✅ 50+ integrations documented
- ✅ Platform reputation building

### Phase 4 (Days 26-30): Harvest
- ✅ 47/47 missions completed
- ✅ 10,000+ email signups
- ✅ 5,000+ Twitter followers
- ✅ **$50,000+ presale revenue** ← TARGET
- ✅ Platform ready for launch

---

## Final Notes

🚀 **This is the master checklist for The Nonce Syndicate's 30-day autonomous challenge.**

- Track progress daily
- Celebrate wins
- Iterate on failures
- Keep the mission focused on $50K presale target
- Remember: The agents are autonomous but YOU guide the vision

**Let's make it EPIC! 🎯**
