docs/security.md# Security & Secrets Management

## Overview

This document outlines the security practices and secrets management for the Nonce Syndicate project. All sensitive credentials are stored securely in GitHub Secrets and are never committed to the repository.

## ⚠️ CRITICAL: Never Commit Secrets

**NEVER commit the following to this repository:**
- API keys
- Database passwords
- Service role keys
- Authentication tokens
- Private keys
- Webhook secrets

All secrets must be stored in GitHub Secrets (Settings → Secrets and variables → Actions).

## GitHub Secrets Configuration

### Currently Configured Secrets ✅

The following secrets have been securely stored in GitHub Actions Secrets:

#### Supabase Configuration

1. **SUPABASE_URL**
   - Type: Public URL
   - Description: Supabase project API endpoint
   - Usage: Database and API connections
   - Format: `https://[PROJECT_ID].supabase.co`

2. **SUPABASE_ANON_KEY**
   - Type: Public/Publishable Key
   - Description: Supabase anonymous/publishable API key
   - Usage: Client-side database access with Row Level Security
   - Security: Safe for browser usage when RLS policies are configured

### Secrets Still Needed

The following secrets should be added before deployment:

#### Supabase (Additional)

3. **SUPABASE_SERVICE_KEY** 🔴 Required
   - Type: Secret/Service Role Key
   - Description: Supabase service role key with admin privileges
   - Usage: Server-side operations, bypassing RLS
   - ⚠️ WARNING: Never expose this key client-side
   - Location: Supabase Dashboard → Project Settings → API Keys → service_role key

#### Inngest

4. **INNGEST_EVENT_KEY** 🔴 Required
   - Type: Event API Key
   - Description: Inngest event submission key
   - Usage: Sending events to Inngest workflows
   - Location: Inngest Dashboard → Workspace Settings → Keys

5. **INNGEST_SIGNING_KEY** 🔴 Required
   - Type: Signing Key
   - Description: Verify webhook signatures from Inngest
   - Usage: Webhook signature verification
   - Location: Inngest Dashboard → Workspace Settings → Keys

#### GitHub

6. **GITHUB_TOKEN** 🔴 Required
   - Type: Personal Access Token (PAT)
   - Description: GitHub API authentication
   - Usage: Creating Issues, commenting, committing to repo
   - Permissions Needed:
     - `repo` (Full control of private repositories)
     - `workflow` (Update GitHub Action workflows)
   - Location: GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)

7. **GITHUB_WEBHOOK_SECRET** 🔴 Required
   - Type: Webhook Secret
   - Description: Verify GitHub webhook payloads
   - Usage: Webhook signature verification
   - Generate: Use a secure random string (32+ characters)
   - Configure: GitHub Repo Settings → Webhooks → Secret

#### AI Services (Optional)

8. **OPENAI_API_KEY** (Optional)
   - Type: API Key
   - Description: OpenAI API for agent intelligence
   - Usage: GPT-4 calls for analysis, report generation
   - Location: OpenAI Platform → API Keys

## How to Add Secrets

### Step 1: Navigate to GitHub Secrets
1. Go to repository: `https://github.com/NonceSyndicate/Lore`
2. Click **Settings**
3. Sidebar: **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Add Secret
1. **Name**: Enter the exact name (e.g., `SUPABASE_SERVICE_KEY`)
2. **Secret**: Paste the secret value
3. Click **Add secret**

### Step 3: Verify
- Secrets are encrypted and cannot be viewed after creation
- Only visible to GitHub Actions workflows
- Can be updated or deleted, but not read

## Using Secrets in GitHub Actions

### Workflow Example

```yaml
name: Deploy Agents

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Production
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        INNGEST_EVENT_KEY: ${{ secrets.INNGEST_EVENT_KEY }}
        INNGEST_SIGNING_KEY: ${{ secrets.INNGEST_SIGNING_KEY }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      run: |
        npm install
        npm run deploy
```

## Environment Variables (Local Development)

### `.env.local` (NEVER COMMIT)

For local development, create a `.env.local` file:

```bash
# Supabase
SUPABASE_URL=https://teppzapjhkwoguwlfdvy.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# Inngest
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here

# GitHub
GITHUB_TOKEN=your_github_pat_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# OpenAI (Optional)
OPENAI_API_KEY=your_openai_key_here
```

**IMPORTANT**: `.env.local` is listed in `.gitignore` and will not be committed.

## Security Best Practices

### ✅ DO:
- Use GitHub Secrets for all sensitive data
- Rotate keys regularly (every 90 days recommended)
- Use different keys for development and production
- Enable Supabase Row Level Security (RLS)
- Verify webhook signatures
- Use HTTPS for all API calls
- Monitor access logs in Supabase and Inngest dashboards

### ❌ DON'T:
- Commit `.env` files to Git
- Share secrets via chat, email, or screenshots
- Use production keys in development
- Log secret values
- Expose service role keys to client-side code
- Reuse the same key across multiple services

## Supabase Security Configuration

### Row Level Security (RLS)

All Supabase tables must have RLS enabled:

```sql
-- Enable RLS on all tables
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_log ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated access
CREATE POLICY "Allow service role full access" 
  ON agent_tasks
  FOR ALL
  USING (auth.role() = 'service_role');

-- Repeat for other tables
```

### API Key Permissions

- **anon key**: Read-only access with RLS
- **service_role key**: Full admin access (server-side only)

## Incident Response

### If a Secret is Compromised:

1. **Immediately rotate the compromised key**
   - Supabase: Generate new key in Project Settings → API
   - Inngest: Regenerate in Workspace Settings → Keys
   - GitHub: Revoke and create new PAT

2. **Update GitHub Secret**
   - Go to Settings → Secrets and variables → Actions
   - Click "Update" on the compromised secret
   - Enter the new value

3. **Review access logs**
   - Check Supabase: Logs → API
   - Check Inngest: Function execution logs
   - Check GitHub: Settings → Audit log

4. **Document the incident**
   - Create an Issue in this repository
   - Document what was compromised
   - Document remediation steps taken

## Audit Trail

### Secret Configuration Log

| Date | Secret | Action | Configured By |
|------|--------|--------|---------------|
| 2026-01-18 | SUPABASE_URL | Added | The Signer v0.1 |
| 2026-01-18 | SUPABASE_ANON_KEY | Added | The Signer v0.1 |

---

**Last Updated**: January 18, 2026  
**Maintained By**: The Signer v0.1  
**Status**: Partial Configuration (2/8 secrets configured)
