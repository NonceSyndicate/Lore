# 🚀 Epic Mission Seeding Guide

## Overview

The **Nonce Syndicate** has a comprehensive 47-mission master plan organized into 4 strategic pillars. This guide walks through applying all missions to your Supabase database.

## Prerequisites

1. **Database Schema**: Run the migration first
   ```bash
   # In Supabase dashboard:
   # 1. Go to SQL Editor
   # 2. Create new query
   # 3. Copy contents of: docs/migrations/001_create_missions_schema.sql
   # 4. Execute query
   ```

2. **Environment Variables**: Ensure these are set
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

## Quick Start - Seed Epic Missions

### Option 1: Automated Script (Recommended)

```bash
# Navigate to workspace root
cd /workspaces/Lore

# Install dependencies (if needed)
npm install

# Run seed script with TypeScript
npx ts-node src/scripts/seed-epic-missions.ts
```

**Output Example:**
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

The Nonce Syndicate is now ready for the 30-day challenge.
```

### Option 2: Manual SQL (If Automated Fails)

See `MANUAL-SQL-INSERTS.md` for complete SQL INSERT statements for all 47 missions.

## Mission Breakdown

### 🌐 Pillar 1: Landing Page (8 Missions)

**Priority Distribution:**
- 🔴 CRITICAL: 1 mission
- 🟠 HIGH: 4 missions  
- 🟡 MEDIUM: 2 missions
- 🟢 LOW: 1 mission

**Objectives:**
1. Design presale landing page with email capture
2. Set up email campaign infrastructure
3. Create presale offer & pricing strategy
4. Implement analytics & tracking
5. Create social proof & testimonials
6. Optimize for SEO & performance
7. Set up multi-channel presale
8. Create FAQ & resources

**Budget:** $900/month

**Success Metrics:**
- Email list: 5,000+ signups
- Presale conversion: 5%
- Lighthouse score: 95+
- Page load time: <2 seconds

---

### 🔧 Pillar 2: Agent Development (14 Missions)

**Priority Distribution:**
- 🔴 CRITICAL: 2 missions
- 🟠 HIGH: 4 missions
- 🟡 MEDIUM: 5 missions
- 🟢 LOW: 3 missions

**Objectives:**
1. Feature branch strategy & protection
2. CI/CD auto-merge pipeline
3. Automated testing (>80% coverage)
4. Agent code generation framework
5. Deployment monitoring & rollback
6. Agent learning system
7. Multi-agent coordination protocol
8. Resource optimizer
9. Conflict resolution
10. Deployment dashboard
11. Development best practices
12. Performance benchmarking
13. Failure analysis system
14. Communication logging

**Budget:** $350/month

**Success Metrics:**
- Zero manual deployments
- 80%+ test coverage
- <5 minute deployment time
- 99.9% uptime

---

### 🐦 Pillar 3: Twitter Bot (12 Missions)

**Priority Distribution:**
- 🔴 CRITICAL: 1 mission
- 🟠 HIGH: 3 missions
- 🟡 MEDIUM: 5 missions
- 🟢 LOW: 3 missions

**Objectives:**
1. Twitter/X API integration
2. Smart tweet generator
3. Tweet scheduling (hourly)
4. Engagement handler (mentions, retweets)
5. Performance metrics tweeter
6. Community engagement tracker
7. Thread generation
8. Trending topic detector
9. Analytics dashboard
10. Content calendar
11. Hashtag strategy
12. Brand voice guidelines

**Budget:** $200/month

**Success Metrics:**
- 1,000+ followers by day 30
- 50,000+ impressions/month
- 5%+ engagement rate
- Hourly automation

---

### 🛠️ Pillar 4: Tools & Ecosystem (13 Missions)

**Priority Distribution:**
- 🔴 CRITICAL: 1 mission
- 🟠 HIGH: 3 missions
- 🟡 MEDIUM: 5 missions
- 🟢 LOW: 4 missions

**Objectives:**
1. Agent template library
2. Open-source SDK (npm)
3. REST API for agents
4. Security scanning tool
5. Analytics dashboard
6. Code snippet library
7. Community forum
8. Development guides
9. GitHub documentation
10. Sample applications
11. Plugin architecture
12. Integration marketplace
13. Certification program

**Budget:** $500/month

**Success Metrics:**
- 500+ SDK downloads
- 1,000+ community members
- 50+ integrations
- 5 sample apps

---

## Verification

### Check Database

```sql
-- In Supabase SQL Editor

-- Count all missions
SELECT COUNT(*) as total_missions FROM missions;

-- Distribution by pillar
SELECT 
  CASE 
    WHEN tags @> ARRAY['landing-page']::text[] THEN 'Landing Page'
    WHEN tags @> ARRAY['infrastructure','devops']::text[] THEN 'Agent Dev'
    WHEN tags @> ARRAY['twitter']::text[] THEN 'Twitter Bot'
    ELSE 'Ecosystem'
  END as pillar,
  COUNT(*) as count
FROM missions
GROUP BY pillar;

-- Distribution by priority
SELECT priority, COUNT(*) as count
FROM missions
GROUP BY priority
ORDER BY priority;

-- Check specific missions
SELECT title, priority, status FROM missions 
WHERE tags @> ARRAY['critical']::text[]
LIMIT 10;
```

### Expected Results

```
Total Missions: 47

By Pillar:
- Landing Page: 8
- Agent Development: 14
- Twitter Bot: 12
- Ecosystem Tools: 13

By Priority:
- CRITICAL: 4
- HIGH: 13
- MEDIUM: 21
- LOW: 9
```

## Next Steps

### Phase 1: Foundation (Days 1-5)
1. ✅ Seed all 47 missions to database
2. 🔄 Complete 4 CRITICAL missions
3. 🔄 Complete 2-3 HIGH priority missions per pillar
4. Monitor mission execution in Inngest dashboard

**CRITICAL Missions:**
- Landing Page: Design presale landing page
- Agent Dev: Feature branch strategy, CI/CD pipeline
- Twitter Bot: Twitter API integration
- Ecosystem: Agent template library

### Phase 2: Execution (Days 6-15)
1. Deploy landing page presale
2. Launch Twitter bot
3. Complete agent development pipeline
4. Activate email campaigns

**Expected Output:**
- 1,000+ email signups
- 500+ Twitter followers
- 4 critical agent functions
- Automated deployment

### Phase 3: Scaling (Days 16-25)
1. Implement ecosystem tools
2. Scale agent development
3. Increase social media reach
4. Expand integrations

**Expected Output:**
- 5,000+ email list
- 2,000+ followers
- 10 agent types
- 20 integrations

### Phase 4: Harvest (Days 26-30)
1. Finalize presale campaign
2. Celebrate achievements
3. Plan Phase 2 roadmap
4. Launch open ecosystem

**Target:**
- $50K+ presale commitments
- 10,000+ followers
- 50+ integrations
- Strong community

---

## Mission Execution Flow

### Signer Orchestrator (Every 30 minutes)

1. **Fetch pending missions** from database
2. **Prioritize** by `priority` field and dependencies
3. **Assign** to available agent
4. **Track execution** via MissionLogger
5. **Update status** based on results

### Agent Assignment

| Agent | Pillar | Missions |
|-------|--------|----------|
| **Signer** | Leadership | 2-3 per cycle |
| **Operator** | Infrastructure | 3-4 per cycle |
| **Researcher** | Analysis | 2-3 per cycle |
| **Scribe** | Content | 3-4 per cycle |

### Monitoring

- **Dashboard**: [Your Vercel App]/api/health
- **Inngest**: [Inngest Dashboard](https://inngest.com)
- **Supabase**: Real-time mission_logs view
- **Twitter**: [@yourhandle](https://twitter.com)

---

## Troubleshooting

### Seed Script Fails

**Error: "SUPABASE_URL is not defined"**
```bash
# Solution: Set environment variables
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-key
npx ts-node src/scripts/seed-epic-missions.ts
```

**Error: "relation 'missions' does not exist"**
```bash
# Solution: Run migration first
# Go to Supabase SQL Editor and execute:
# docs/migrations/001_create_missions_schema.sql
```

### Duplicate Missions

**If seed runs twice:**
```sql
-- Delete epic missions that were duplicated
DELETE FROM missions WHERE created_by = 'epic-seed' AND status = 'pending';

-- Or full reset (careful!)
DELETE FROM missions;
DELETE FROM signer_context;
DELETE FROM mission_results;
DELETE FROM mission_logs;
```

### Permission Errors

Ensure your Supabase key has:
- `INSERT` on `missions` table
- `SELECT` on `missions` table (for checking duplicates)
- Can execute migrations

---

## Customizing Missions

### Modify Mission Priorities

Edit `src/scripts/seed-epic-missions.ts`:

```typescript
{
  title: 'Your Mission',
  priority: 'critical', // Change priority
  status: 'pending',
  budget_limit_usd: 500, // Adjust budget
  assigned_to: 'signer', // Change assigned agent
  context: {
    objectives: [...],  // Edit objectives
    autonomous: true,   // Enable/disable auto-execution
  }
}
```

### Add Custom Missions

```typescript
epicMissions.push({
  title: '🎯 Your Custom Mission',
  description: 'Custom mission description',
  priority: 'high',
  status: 'pending',
  assigned_to: 'operator',
  context: {
    objectives: ['Objective 1', 'Objective 2'],
    tools_available: ['Tool 1'],
    budget_limit_usd: 100,
    autonomous: true,
  },
  tags: ['custom', 'your-tag'],
  metadata: { category: 'custom' },
});
```

Then re-run seed script.

---

## Performance Impact

### Database Size

- **Missions Table**: ~2 MB (47 missions + metadata)
- **Growth**: ~0.5 KB per mission log entry

### API Queries

- **Fetch pending missions**: 10ms (indexed on status)
- **Update mission status**: 5ms (indexed on id)
- **Create mission log**: 15ms (write operation)

### Inngest Events

- **Per cycle (30 min)**: 5-10 events
- **Daily**: 240-480 events
- **Monthly**: 7,200-14,400 events

All within Inngest free tier limits.

---

## Next Commands

After seeding, run:

```bash
# Check database
npx ts-node -e "import('./src/scripts/seed-epic-missions.ts')"

# Run Signer Orchestrator manually
curl http://localhost:3000/api/inngest \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"event":{"name":"signer/orchestrator","data":{}}}'

# View missions in Supabase
# Go to: https://app.supabase.com/project/[project]/editor/missions
```

---

## Summary

✅ **Epic Mission System Ready**
- 47 comprehensive missions organized into 4 pillars
- Clear priority and budget allocation
- Autonomous execution framework
- Real-time monitoring & logging
- Community-driven development

**Total Investment**: ~$1,950/month
**Expected ROI**: $50K+ presale in 30 days
**Team Size**: 1 (Signer) + 4 agents
**Timeline**: 30-day challenge

🚀 **THE NONCE SYNDICATE IS READY TO CONQUER!**
