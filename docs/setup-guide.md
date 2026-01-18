# Nonce Syndicate: Agent System Setup Guide

## Overview

This guide documents the setup and configuration of the Nonce Syndicate multi-agent system using Inngest for workflow orchestration and Supabase for state management.

## Architecture Summary

The Nonce Syndicate operates through a coordinated system of specialized AI agents:

### Agent Roles

1. **OPERATOR** - Workflow coordinator and task distributor
2. **AUDITOR** - Smart contract security scanner  
3. **RESEARCHER** - Crypto project analyst
4. **SCRIBE** - Documentation and lore writer
5. **NEGOTIATOR** - Client communication manager

### Technology Stack

- **Workflow Engine**: Inngest (serverless function orchestration)
- **Database**: Supabase (PostgreSQL + Real-time)
- **Version Control**: GitHub (public transparency log)
- **Runtime**: Node.js / TypeScript

## Service Configuration

### Inngest Setup ✅

**Workspace**: `nonce-syndicate`  
**Environment**: Production  
**Dashboard**: https://app.inngest.com/

#### Key Features Used:
- Event-driven function execution
- Automatic retries and error handling
- Webhook integration with GitHub
- Scheduled cron jobs for 24/7 operations

#### Configuration:
```typescript
// inngest.config.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'nonce-syndicate',
  name: 'Nonce Syndicate Agents',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
```

### Supabase Setup ✅

**Organization**: Nonce Syndicate  
**Project**: `nonce-syndicate-agents`  
**Region**: AWS US-East-1 (us-east-1)  
**Project ID**: `teppzapjhkwoguwlfdvy`

#### Connection Details:
```bash
# API Endpoint
URL: https://teppzapjhkwoguwlfdvy.supabase.co

# API Keys (use environment variables)
SUPABASE_URL=https://teppzapjhkwoguwlfdvy.supabase.co
SUPABASE_ANON_KEY=[Your Publishable Key]
SUPABASE_SERVICE_KEY=[Your Secret Key - Server Only]
```

#### Database Schema:

**Tables**:

1. `agent_tasks` - Task queue and execution log
```sql
CREATE TABLE agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  task_type TEXT NOT NULL,
  input_data JSONB,
  status TEXT DEFAULT 'pending',
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

2. `agent_state` - Agent operational state
```sql
CREATE TABLE agent_state (
  agent_type TEXT PRIMARY KEY,
  status TEXT DEFAULT 'idle',
  current_task_id UUID REFERENCES agent_tasks(id),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

3. `service_requests` - Client service request tracking
```sql
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_issue_number INTEGER,
  service_type TEXT NOT NULL,
  client_info JSONB,
  status TEXT DEFAULT 'new',
  assigned_agents TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

4. `treasury_log` - Financial operations audit trail
```sql
CREATE TABLE treasury_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL,
  amount DECIMAL,
  balance DECIMAL NOT NULL,
  description TEXT,
  approved_by TEXT,
  transaction_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Environment Variables

Create a `.env` file (NEVER commit to Git):

```bash
# Inngest
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Supabase
SUPABASE_URL=https://teppzapjhkwoguwlfdvy.supabase.co
SUPABASE_ANON_KEY=your_publishable_key
SUPABASE_SERVICE_KEY=your_service_role_key

# GitHub
GITHUB_TOKEN=your_personal_access_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# OpenAI (for agent intelligence)
OPENAI_API_KEY=your_openai_api_key
```

## GitHub Webhooks Configuration

### Setup Instructions:

1. Go to repository Settings → Webhooks
2. Add webhook:
   - **Payload URL**: `https://your-deployment-url.com/api/inngest`
   - **Content type**: `application/json`
   - **Secret**: (generate secure random string)
   - **Events**: Select individual events:
     - Issues
     - Issue comments
     - Pull requests
     - Push

### Event Handling:

The OPERATOR agent listens for:
- `issues.opened` → New service request
- `issues.labeled` → Priority or assignment changes
- `issue_comment.created` → Client communication
- `pull_request.opened` → Code review needed

## Agent Workflow Example

### Service Request Flow:

```
1. Client opens GitHub Issue ("Smart Contract Audit Request")
   ↓
2. GitHub webhook → Inngest event
   ↓
3. OPERATOR receives event
   - Validates request
   - Creates task in Supabase
   - Assigns to AUDITOR
   ↓
4. AUDITOR executes
   - Fetches contract code
   - Runs security scans
   - Generates report
   - Updates Supabase state
   ↓
5. OPERATOR reviews result
   - Requests human approval (Jonah)
   - Waits for confirmation
   ↓
6. SCRIBE publishes
   - Formats audit report
   - Commits to /docs/audits/
   - Comments on GitHub Issue
   ↓
7. NEGOTIATOR handles payment
   - Posts payment details
   - Waits for transaction
   - Updates treasury log
```

## Deployment Checklist

### Initial Setup:
- [x] Inngest workspace created
- [x] Supabase project created
- [x] GitHub repository initialized
- [ ] Database tables created
- [ ] Environment variables configured
- [ ] Agent code deployed
- [ ] GitHub webhooks connected
- [ ] Test service request completed

### Security Checklist:
- [ ] All API keys stored in environment variables (not in code)
- [ ] Supabase Row Level Security (RLS) policies configured
- [ ] GitHub webhook secret verified
- [ ] Inngest signing key validated
- [ ] Service role key restricted to server-side only

## Testing

### Manual Test:

1. Open a GitHub Issue with label "service:audit"
2. Check Inngest dashboard for function execution
3. Verify Supabase table updates
4. Confirm agent comment on Issue

### Health Check Endpoints:

```bash
# Check Inngest connection
curl https://your-deployment-url.com/api/inngest

# Check Supabase connection  
curl https://your-deployment-url.com/api/health
```

## Monitoring

### Inngest Dashboard:
- Function execution logs
- Error tracking
- Retry attempts
- Performance metrics

### Supabase Dashboard:
- Database queries
- Real-time subscriptions
- API usage
- Performance insights

### GitHub Activity:
- All agent actions visible in commits and comments
- Public transparency log
- Audit trail for compliance

## Next Steps

1. **Create Database Schema**: Run SQL migrations in Supabase
2. **Deploy Agent Code**: Set up hosting (Vercel/Railway/Fly.io)
3. **Configure Webhooks**: Connect GitHub to Inngest
4. **Test First Agent**: Deploy OPERATOR and verify
5. **Add Remaining Agents**: AUDITOR, RESEARCHER, SCRIBE, NEGOTIATOR
6. **Enable Cron Jobs**: Schedule periodic checks
7. **Document Operations**: Update /logs/ daily

## Support

- **Inngest Docs**: https://www.inngest.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Webhooks**: https://docs.github.com/webhooks

---

**Status**: Configuration Complete ✅  
**Last Updated**: January 18, 2026  
**Configured By**: The Signer v0.1
