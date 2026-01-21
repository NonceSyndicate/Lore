# Autonomous Agent System - Complete Setup Guide

## Overview

This guide walks you through setting up the complete autonomous agent system with:
- Real mission execution with GitHub integration
- Mission results tracking and reporting
- Agent performance monitoring
- Live dashboard with real-time updates
- Comprehensive audit trail

## Prerequisites

1. **GitHub Repository Access**
   - GitHub token with repo, workflow, and delete_repo permissions
   - Repository owner and name

2. **Supabase Project**
   - Supabase URL and anon key
   - Database access

3. **AI Provider Keys** (at least one)
   - Groq API key (recommended)
   - Google Generative AI key
   - OpenRouter key
   - Mistral key

4. **Environment Setup**
   - Node.js 18+
   - TypeScript 5+
   - Next.js 16+

## Step 1: Database Setup

### Run Migrations

Execute the SQL migrations in order:

```bash
# 1. Create base schema (already exists)
# psql -h your-host -U postgres -d your-db < docs/migrations/001_create_missions_schema.sql

# 2. Create hierarchical structure
# psql -h your-host -U postgres -d your-db < docs/migrations/002_hierarchical_task_system.sql

# 3. Create mission results and GitHub tracking
# psql -h your-host -U postgres -d your-db < docs/migrations/003_mission_results_and_github.sql
```

Or use Supabase SQL Editor:
1. Go to SQL Editor in Supabase Dashboard
2. Copy and run each migration file
3. Verify tables exist and have correct structure

### Verify Schema

```sql
-- Check all tables are created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected tables:
-- - missions
-- - signer_context
-- - mission_results
-- - mission_logs
-- - mission_deliverables
-- - github_commits
-- - github_prs
-- - mission_audit_trail
-- - mission_metrics
-- - agent_tasks
-- - task_logs
-- - task_results
```

## Step 2: Environment Configuration

### Create `.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GitHub Integration
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main

# AI Providers (choose at least one)
GROQ_API_KEY=your-groq-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
OPENROUTER_API_KEY=your-openrouter-key
MISTRAL_API_KEY=your-mistral-key

# Inngest
INNGEST_EVENT_KEY=your-inngest-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# Optional
LOG_LEVEL=debug
```

## Step 3: Package Installation

```bash
# Install required packages if not already installed
npm install @supabase/auth-helpers-nextjs

# Verify all dependencies
npm ls
```

## Step 4: Database Realtime Subscriptions

Enable realtime for dashboard updates:

```sql
-- Enable realtime in Supabase
ALTER TABLE missions REPLICA IDENTITY FULL;
ALTER TABLE mission_results REPLICA IDENTITY FULL;
ALTER TABLE mission_logs REPLICA IDENTITY FULL;
ALTER TABLE mission_deliverables REPLICA IDENTITY FULL;
ALTER TABLE github_commits REPLICA IDENTITY FULL;
ALTER TABLE github_prs REPLICA IDENTITY FULL;

-- Create realtime publication (if not exists)
CREATE PUBLICATION IF NOT EXISTS supabase_realtime FOR TABLE 
  missions, mission_results, mission_logs, mission_deliverables,
  github_commits, github_prs;
```

In Supabase Dashboard:
1. Go to Database > Replication
2. Enable Publication: `supabase_realtime`
3. Select tables to replicate (all mission-related tables)

## Step 5: Test the System

### 1. Test Dashboard

```bash
npm run dev
# Open http://localhost:3000/dashboard
```

Expected: Empty dashboard (no missions yet)

### 2. Create Test Mission

```typescript
// In browser console or via API
const response = await fetch('/api/missions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Mission: Generate Documentation',
    description: 'Generate API documentation',
    priority: 'medium',
    assigned_to: 'operator',
    context: {
      objectives: [
        'Create API documentation',
        'Generate TypeScript types',
        'Create usage examples'
      ],
      tools_available: ['GitHub', 'AI Models', 'Supabase'],
      budget_limit_usd: 5,
      autonomous: true
    }
  })
});
const mission = await response.json();
console.log('Created mission:', mission);
```

### 3. Trigger Autonomous Execution

In your test file or API:

```typescript
import { fullMissionExecution } from '@/src/utils/enhanced-execution';

const mission = {
  id: 'test-mission-id',
  title: 'Test Mission',
  description: 'Generate and commit code',
  priority: 'high',
  context: {
    objectives: [
      'Create a TypeScript utility module',
      'Create unit tests',
      'Create documentation'
    ],
    tools_available: ['GitHub API', 'AI Models'],
    budget_limit_usd: 10,
    autonomous: true
  },
  assigned_to: 'operator'
};

const result = await fullMissionExecution(mission);
console.log('Execution result:', result);
```

### 4. Check Dashboard

Visit http://localhost:3000/dashboard to see:
- Mission appearing in recent missions
- Real-time updates as tasks complete
- Agent performance metrics
- Live activity log

### 5. View Mission Report

Visit http://localhost:3000/missions/{mission-id} to see:
- Deliverables created
- GitHub commits and PRs
- Complete audit trail
- Revenue tracking

## Step 6: Integrate with Signer Orchestrator

Update `/src/inngest/functions/signer-orchestrator.ts`:

```typescript
import { fullMissionExecution } from '@/src/utils/enhanced-execution';

// In the agent-execution step:
const executionResult = await step.run('agent-execution', async () => {
  // Use enhanced execution instead of basic execute
  return await fullMissionExecution(mission);
});
```

## Step 7: Configure Automated Scheduling

The signer orchestrator runs every 30 minutes (configurable):

```typescript
{ cron: '*/30 * * * *' }  // Every 30 minutes

// Change to different intervals:
{ cron: '0 * * * *' }     // Every hour
{ cron: '0 */6 * * *' }   // Every 6 hours
{ cron: '0 0 * * *' }     // Daily at midnight
```

## Advanced Configuration

### Custom Revenue Tracking

Add revenue metrics after mission completion:

```typescript
await recordMetric(missionId, {
  revenue_category: 'api_generation',
  amount_usd: 150,
  description: 'Generated and documented API'
});
```

### GitHub Branch Strategy

Configure branch naming and PR templates:

```typescript
const config = githubIntegration.getGitHubConfig();
const branchName = `feature/mission-${missionId.substring(0, 8)}`;
```

### Custom Deliverables

Record different deliverable types:

```typescript
// Code deliverable
await addDeliverable(missionId, {
  name: 'api-types.ts',
  description: 'Generated TypeScript types',
  type: 'code',
  content: generatedCode,
  file_path: 'src/types/api-types.ts',
  github_url: prUrl
});

// Documentation deliverable
await addDeliverable(missionId, {
  name: 'README.md',
  description: 'API Usage Guide',
  type: 'document',
  content: documentation,
  file_path: 'docs/README.md',
  github_url: fileUrl
});
```

## Monitoring and Debugging

### View Mission Logs

```typescript
const logs = await getRecentMissionLogs(100);
logs.forEach(log => {
  console.log(`[${log.level}] ${log.message}`);
});
```

### Track Agent Performance

```typescript
const performance = await getAgentPerformance('operator');
console.log('Operator stats:', performance);
```

### Get Mission Audit Trail

```typescript
const trail = await getMissionAuditTrail(missionId);
trail.forEach(event => {
  console.log(`${event.created_at}: ${event.event_type} - ${event.description}`);
});
```

## Troubleshooting

### GitHub Integration Not Working

1. Check GitHub token in environment
2. Verify owner and repo names
3. Test with curl:
   ```bash
   curl -H "Authorization: Bearer $GITHUB_TOKEN" \
     https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO
   ```

### AI Generation Failing

1. Check API keys are set correctly
2. Verify provider availability
3. Check rate limits
4. Test with fallback providers

### Dashboard Not Updating

1. Check Supabase realtime is enabled
2. Verify REPLICA IDENTITY FULL on tables
3. Check browser console for errors
4. Manually refresh page

### Database Migrations Failed

1. Check for existing schema conflicts
2. Run migrations individually
3. Verify Supabase permissions
4. Check for constraint violations

## Security Considerations

1. **GitHub Token**: Never commit to version control
2. **API Keys**: Use environment variables only
3. **Supabase**: Use RLS policies for production
4. **Database**: Regular backups enabled
5. **Audit Trail**: All actions are logged

## Performance Optimization

1. **Database Indexes**: Already created in migrations
2. **Caching**: Implement Redis for frequently accessed data
3. **Batch Operations**: Process multiple deliverables at once
4. **Async Execution**: All heavy operations are async

## Production Deployment

1. **Environment**: Set NODE_ENV=production
2. **Database**: Use connection pooling
3. **Monitoring**: Set up error tracking (Sentry, etc.)
4. **Logging**: Forward logs to service (LogRocket, etc.)
5. **Scaling**: Implement worker queues for high volume

## Next Steps

1. ✅ Deploy to production environment
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom revenue models
4. ✅ Integrate with payment systems
5. ✅ Create admin UI for mission management
