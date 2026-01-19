# Autonomous Agent Deployment Strategy

## Overview

This document outlines the deployment strategy for the Nonce Syndicate Lore autonomous agent system, ensuring zero-downtime deployments and graceful handling of updates without breaking autonomous loops.

## Problem Statement

The autonomous agent system runs on a scheduler (5-minute intervals for the coordinator) and handles event-driven task execution. Deployments can:
- Interrupt running agents mid-task
- Cause database connection failures during updates
- Break event processing chains
- Leave tasks in inconsistent states

## Solution: Blue-Green Deployment with Graceful Degradation

### Architecture

```
┌─────────────────────────────────────────┐
│ Vercel (Next.js + Inngest)              │
├─────────────────────────────────────────┤
│ ┌─────────────────┐  ┌─────────────────┐│
│ │  Blue (Live)    │  │ Green (Staging) ││
│ │ v1.0.0 (active) │  │ v1.0.1 (test)   ││
│ │ Tasks running   │  │ Idle            ││
│ └─────────────────┘  └─────────────────┘│
└─────────────────────────────────────────┘
         ▼
    Supabase DB (single)
    - agent_state
    - agent_tasks
    - task_queue
```

### Deployment Steps

#### Phase 1: Pre-Deployment (Green Environment Setup)
1. Build new version in Green environment
2. Run full test suite against staging database replica
3. Verify all agent functions are healthy
4. Validate database migrations (if any)

#### Phase 2: Traffic Switch (Blue to Green)
1. **Drain existing tasks** (5-minute grace period)
   - Set flag in Inngest: `DEPLOYMENT_IN_PROGRESS = true`
   - Stop scheduling new coordinator runs
   - Wait for in-flight tasks to complete
2. **Switch DNS/Load Balancer to Green**
   - Update Vercel environment to active Green
   - Keep Blue running as fallback (5 minutes)
3. **Health Check**
   - Verify new functions are receiving events
   - Check agent state updates
   - Monitor error logs

#### Phase 3: Post-Deployment (Validation)
1. Monitor for 15 minutes
2. If successful: promote Green to Blue
3. If issues: automatic rollback to Blue (within 5 minutes)

### Database Schema Requirements

Add deployment tracking to support zero-downtime:

```sql
-- Migration: Add deployment state tracking
ALTER TABLE agent_state ADD COLUMN deployment_version TEXT;
ALTER TABLE agent_tasks ADD COLUMN deployment_version TEXT;

CREATE TABLE deployment_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  status ENUM('staging', 'live', 'rollback') NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  activated_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

### Code-Level Guards

All agent functions include:

```typescript
// 1. Supabase validation
if (!supabase) {
  throw new Error('Supabase client not initialized');
}

// 2. Graceful error handling
try {
  // agent work
} catch (error) {
  console.error('[Agent] Error:', error);
  // Mark task as failed
  // Retry via Inngest's built-in retry mechanism
}

// 3. Deployment awareness (optional)
const DEPLOYMENT_MODE = process.env.DEPLOYMENT_VERSION;
const GRACEFUL_SHUTDOWN = process.env.GRACEFUL_SHUTDOWN === 'true';

if (GRACEFUL_SHUTDOWN && task.deployment_version !== DEPLOYMENT_MODE) {
  // Don't pick up tasks from old deployment
  return { skipped: true };
}
```

## Environment Variables

### For Blue-Green Deployment

```env
# Vercel deployment
DEPLOYMENT_VERSION=v1.0.1
GRACEFUL_SHUTDOWN=false              # Set to 'true' during drain phase

# Inngest
INNGEST_EVENT_KEY=<your-key>
INNGEST_SIGNING_KEY=<your-key>

# Supabase (must be consistent across versions)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
```

## Deployment Checklist

- [ ] All tests pass locally and in CI
- [ ] TypeScript compiles without errors
- [ ] Database migrations tested on staging
- [ ] Inngest functions validated
- [ ] Environment variables set in Green environment
- [ ] Health check endpoints verified
- [ ] Rollback plan documented and tested
- [ ] Team notified of deployment window
- [ ] Monitoring dashboards open (Inngest, Vercel, Supabase)

## Monitoring During Deployment

### Key Metrics

1. **Task Completion Rate**
   ```
   SELECT 
     COUNT(*) FILTER (WHERE status = 'completed') as completed,
     COUNT(*) FILTER (WHERE status = 'failed') as failed,
     ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / 
            COUNT(*), 2) as success_rate
   FROM agent_tasks
   WHERE created_at > now() - interval '15 minutes';
   ```

2. **Agent Health**
   ```
   SELECT agent_type, status, COUNT(*) as count
   FROM agent_state
   GROUP BY agent_type, status;
   ```

3. **Error Rate in Inngest**
   - View in Inngest dashboard
   - Watch for > 5% error rate as signal to rollback

### Rollback Triggers

Automatic rollback if:
- Error rate exceeds 10% for 2+ minutes
- Database connection errors > 5% of requests
- Task completion rate drops below 85%
- Any critical function fails to initialize

## Graceful Shutdown Protocol

When deploying:

1. Set `GRACEFUL_SHUTDOWN=true` in Vercel
2. Stop accepting new task assignments
3. Complete in-flight operations (within timeout)
4. Return clear error messages for any orphaned tasks
5. After deployment: set `GRACEFUL_SHUTDOWN=false`

## Runbook: Emergency Rollback

If deployment fails:

```bash
# 1. Identify issue
# - Check Inngest logs for error spikes
# - Verify Supabase connectivity
# - Review agent function errors

# 2. Trigger rollback
# - Vercel dashboard: Promote previous deployment
# - Or: `vercel rollback`

# 3. Mark tasks for retry
# UPDATE agent_tasks 
# SET status = 'pending' 
# WHERE status = 'in_progress' 
# AND updated_at < now() - interval '5 minutes';

# 4. Resume coordinator
# - Tasks will be picked up by next 5-minute cycle
# - Agents will reconnect automatically
```

## Long-Term Improvements

1. **Canary Deployments**
   - Route 10% of tasks to Green initially
   - Gradually increase traffic
   - Automatic rollback if errors spike

2. **Database Versioning**
   - Support multiple schema versions simultaneously
   - Gradual schema migration over multiple deployments

3. **Event Replay**
   - Archive events during deployment
   - Replay any missed events after stabilization

4. **Task Persistence**
   - Store task state in Redis for faster recovery
   - Sync back to Supabase periodically

## Support

For deployment issues:
1. Check Inngest dashboard: https://app.inngest.com
2. View logs: Vercel deployment logs
3. Database: Supabase SQL editor for debugging
4. Contact: Include error logs and timestamp of deployment
