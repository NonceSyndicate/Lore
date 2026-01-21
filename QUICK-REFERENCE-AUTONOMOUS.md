# Quick Reference - Autonomous Agent System

## 🎯 Quick Start (5 minutes)

### 1. Setup Environment
```bash
# Copy template
cp .env.example .env.local

# Add your keys:
# GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO
# GROQ_API_KEY (or other AI provider)
# SUPABASE credentials
```

### 2. Run Migrations
In Supabase Dashboard > SQL Editor:
- Copy and run: `docs/migrations/003_mission_results_and_github.sql`

### 3. Start Server
```bash
npm run dev
```

### 4. View Dashboard
Open: `http://localhost:3000/dashboard`

## 📊 Dashboard Tour

| Section | What You See | Real-time? |
|---------|-------------|-----------|
| Summary Cards | Total missions, completed, failed, revenue, commits, PRs | ✅ Yes |
| Recent Missions Table | Last 20 missions with status and metrics | ✅ Yes |
| Agent Performance | Success rates, revenue, commits by agent | ✅ Yes |
| Activity Log | Real-time log entries as they happen | ✅ Yes |

## 🚀 Create & Execute a Mission

### Via API
```bash
curl -X POST http://localhost:3000/api/missions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Generate API Module",
    "description": "Create a new TypeScript module",
    "priority": "high",
    "assigned_to": "operator",
    "context": {
      "objectives": [
        "Create utility functions",
        "Add TypeScript types",
        "Create unit tests"
      ],
      "tools_available": ["GitHub", "AI"],
      "budget_limit_usd": 5,
      "autonomous": true
    }
  }'
```

### Via Dashboard
1. Navigate to dashboard
2. Create mission button (coming soon in admin UI)
3. Or use API call above

## 📈 Monitor Progress

### Check Mission Status
```bash
# Get all missions
curl http://localhost:3000/api/missions?status=in_progress

# Get completed missions
curl http://localhost:3000/api/missions?status=completed

# Filter by agent
curl http://localhost:3000/api/missions?assigned_to=operator
```

### View Mission Report
```bash
# Visit in browser
http://localhost:3000/missions/{mission-id}

# Or get JSON
curl http://localhost:3000/api/missions/{mission-id}/report
```

## 🔧 Common Tasks

### Track Mission Revenue
```typescript
import { recordMetric } from '@/src/utils/mission-results';

await recordMetric(missionId, {
  revenue_category: 'api_generation',
  amount_usd: 150,
  description: 'Generated API documentation'
});
```

### Record Deliverable
```typescript
import { addDeliverable } from '@/src/utils/mission-results';

await addDeliverable(missionId, {
  name: 'api-types.ts',
  description: 'Generated TypeScript types',
  type: 'code',
  content: typeScriptCode,
  file_path: 'src/types/api-types.ts',
  github_url: 'https://github.com/.../pull/123'
});
```

### Complete Mission
```typescript
import { completeMission } from '@/src/utils/mission-results';

await completeMission(missionId, {
  mission_id: missionId,
  summary: 'Successfully generated API module',
  outcome: 'success',
  execution_time_seconds: 45,
  cost_usd: 2.50,
  revenue_usd: 150,
  results: { tasks_completed: 3, files_created: 2 },
  errors: {}
});
```

### Get Mission Stats
```typescript
import { getMissionStats } from '@/src/utils/mission-results';

const stats = await getMissionStats(missionId);
console.log(`
  Status: ${stats.status}
  Revenue: $${stats.revenue_usd}
  Commits: ${stats.github_commits}
  PRs: ${stats.github_prs}
  Deliverables: ${stats.deliverables}
`);
```

## 🔍 Debugging

### View Mission Logs
```typescript
import { getRecentMissionLogs } from '@/src/utils/mission-results';

const logs = await getRecentMissionLogs(50);
logs.forEach(log => {
  console.log(`[${log.level}] ${log.agent_name}: ${log.message}`);
});
```

### Get Audit Trail
```typescript
import { getMissionAuditTrail } from '@/src/utils/mission-results';

const trail = await getMissionAuditTrail(missionId);
trail.forEach(event => {
  console.log(`${event.created_at}: ${event.event_type} - ${event.description}`);
});
```

### Check Agent Performance
```typescript
import { getAgentPerformance } from '@/src/utils/mission-results';

const performance = await getAgentPerformance('operator');
console.log(`
  Total Missions: ${performance.total_missions}
  Success Rate: ${performance.success_rate}%
  Total Revenue: $${performance.total_revenue_usd}
  Commits: ${performance.total_commits}
`);
```

## 🐛 Common Issues

### Dashboard Shows No Data
```bash
# Check if missions exist
curl http://localhost:3000/api/missions

# If empty, create a test mission with the curl command above
```

### GitHub Integration Not Working
```bash
# Verify token is valid
echo $GITHUB_TOKEN
git config --global user.email "test@example.com"
git config --global user.name "Test User"

# Test GitHub connection
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO
```

### AI Generation Failing
```bash
# Check API keys are set
echo $GROQ_API_KEY
echo $GOOGLE_GENERATIVE_AI_API_KEY

# Check logs for which provider is being used
# Look for "Using groq" or "Using gemini" etc in console
```

### Database Connection Issues
```bash
# Verify Supabase URL and keys
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
npm run dev  # Should connect successfully
```

## 📊 Data Models

### Mission
```typescript
{
  id: UUID,
  title: string,
  description: string,
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  priority: 'low' | 'medium' | 'high' | 'critical',
  assigned_to: 'signer' | 'operator' | 'researcher' | 'scribe',
  context: {
    objectives: string[],
    tools_available: string[],
    budget_limit_usd: number,
    autonomous: boolean
  },
  created_at: timestamp,
  started_at?: timestamp,
  completed_at?: timestamp
}
```

### MissionResult
```typescript
{
  mission_id: UUID,
  outcome: 'success' | 'partial' | 'failed' | 'abandoned',
  summary: string,
  execution_time_seconds: number,
  cost_usd: number,
  revenue_usd: number,
  results: object,
  errors: object,
  completed_at: timestamp
}
```

### Deliverable
```typescript
{
  mission_id: UUID,
  name: string,
  description: string,
  type: 'code' | 'document' | 'analysis' | 'report' | 'other',
  content?: string,
  file_path?: string,
  github_url?: string,
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  created_at: timestamp
}
```

## 🔗 Important Files

| File | Purpose |
|------|---------|
| `app/dashboard/page.tsx` | Dashboard UI |
| `app/missions/[id]/page.tsx` | Mission report page |
| `app/api/missions/route.ts` | Mission API endpoints |
| `src/utils/github-integration.ts` | GitHub operations |
| `src/utils/mission-results.ts` | Results tracking |
| `src/utils/enhanced-execution.ts` | Real work execution |
| `src/inngest/functions/signer-orchestrator.ts` | Main orchestrator |

## 📚 Full Docs

- Setup: `docs/AUTONOMOUS-SYSTEM-SETUP.md`
- Implementation: `AUTONOMOUS-IMPLEMENTATION-COMPLETE.md`
- Architecture: `docs/mission-system-architecture.md`

## 🎯 Next Steps

1. ✅ Create a test mission
2. ✅ Watch it execute in real-time
3. ✅ View the report with deliverables
4. ✅ Check GitHub for created PRs
5. ✅ Track revenue in dashboard
6. ✅ Deploy to production

---

**Need help?** Check the logs with `npm run dev` and look for error messages, or consult the full setup guide.
