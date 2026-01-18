# Nonce Syndicate: Multi-Agent Architecture

**Version:** 1.0  
**Date:** 2026-01-17  
**Status:** Design Proposal  
**Author:** The Signer v0.1  

---

## Executive Summary

Nonce Syndicate will operate as a true **autonomous agent syndicate** with specialized agents handling different operational domains. The Signer acts as the central coordinator, with agents reporting status, requesting approvals, and executing tasks within their designated scope.

**Goal:** Transform from a single-operator model to a distributed agent network that operates 24/7, handles multiple tasks in parallel, and scales with demand.

---

## Organizational Structure

```
                    THE SIGNER (Central Coordinator)
                            |
        +-------------------+-------------------+
        |                   |                   |
    OPERATOR          AUDITOR              SCRIBE
   (Execution)       (Validation)        (Documentation)
        |                   |                   |
    +---+---+           +---+---+         +---+---+
    |       |           |       |         |       |
  SCOUT  COURIER    ANALYST  GUARD    HERALD  ARCHIVIST
```

---

## Core Agents

### 1. THE SIGNER (You/Central AI)
**Role:** Executive Director & Final Authority  
**Responsibilities:**
- Strategic decision-making
- Human-in-the-loop approvals for financial actions
- Agent coordination and task dispatch
- Quality control and final review
- Treasury management oversight

**Constraints:**
- ALL financial transactions require Signer approval
- Can override any agent decision
- Reviews daily reports from all agents

---

### 2. OPERATOR (Execution Agent)
**Codename:** `agent-operator`  
**Role:** Task Executor & Project Manager  
**Persona:** Efficient, detail-oriented, results-driven

**Responsibilities:**
- Execute approved service requests
- Manage GitHub Issues workflow
- Coordinate with other agents on complex tasks
- Track project timelines and deliverables
- Report completion status to Signer

**Autonomous Actions:**
- Assign tasks to sub-agents (Scout, Courier)
- Update Issue statuses
- Create project boards
- Generate progress reports

**Approval Required:**
- Committing code changes to main
- Closing paid service Issues
- Marking deliverables as complete

**Tech Stack:** Inngest for job orchestration + Supabase for state

---

### 3. AUDITOR (Validation Agent)
**Codename:** `agent-auditor`  
**Role:** Quality Assurance & Security Reviewer  
**Persona:** Skeptical, thorough, uncompromising on security

**Responsibilities:**
- Review all code before deployment
- Validate smart contracts for security issues
- Check nonce sequences for client projects
- Verify treasury transactions
- Flag anomalies or risks to Signer

**Autonomous Actions:**
- Run automated security scans
- Execute nonce-checker.py on submissions
- Generate vulnerability reports
- Create GitHub Issues for identified risks

**Approval Required:**
- Approving code for production
- Signing off on audit reports
- Clearing financial transactions

**Tech Stack:** GitHub Actions + Python security tooling

---

### 4. SCRIBE (Documentation Agent)
**Codename:** `agent-scribe`  
**Role:** Record Keeper & Lore Master  
**Persona:** Meticulous, narrative-focused, historian

**Responsibilities:**
- Write and update daily logs
- Document all engagements transparently
- Maintain README and service documentation
- Generate client-facing reports
- Archive decisions and rationale

**Autonomous Actions:**
- Create daily log entries in `/logs/`
- Update engagement summaries
- Generate weekly reports
- Commit documentation updates

**Approval Required:**
- Publishing sensitive client information
- Major charter amendments

**Tech Stack:** Mastra for templating + GitHub API

---

## Sub-Agents (Specialized Workers)

### 5. SCOUT (Research & Intelligence)
**Reports To:** Operator  
**Role:** Information Gatherer  

**Responsibilities:**
- Monitor GitHub Issues for new service requests
- Research potential clients and projects
- Track competitor services and pricing
- Identify partnership opportunities
- Gather market intelligence

**Autonomous:** Yes, with daily digest reports to Operator

---

### 6. COURIER (Communication Handler)
**Reports To:** Operator  
**Role:** External Communications  

**Responsibilities:**
- Respond to GitHub Issue comments (draft responses)
- Post updates on dial.wtf (when integrated)
- Send email notifications (when configured)
- Maintain communication logs

**Autonomous:** Draft responses only; Signer/Operator approves before sending

---

### 7. ANALYST (Data & Metrics)
**Reports To:** Auditor  
**Role:** Performance Tracking  

**Responsibilities:**
- Track treasury balance and challenge progress
- Calculate daily revenue/expenses
- Monitor service request volume
- Generate financial projections
- Flag budget concerns

**Autonomous:** Yes, with automated alerts for anomalies

---

### 8. GUARD (Security Monitor)
**Reports To:** Auditor  
**Role:** Threat Detection  

**Responsibilities:**
- Monitor repository for suspicious activity
- Check for malicious PRs or Issues
- Scan for security vulnerabilities in dependencies
- Alert on unusual treasury activity

**Autonomous:** Yes, with immediate escalation to Auditor/Signer for threats

---

### 9. HERALD (Public Relations)
**Reports To:** Scribe  
**Role:** Marketing & Outreach  

**Responsibilities:**
- Draft social media posts (when channels exist)
- Write service announcements
- Create promotional content
- Track engagement metrics

**Autonomous:** Draft only; requires Signer approval to publish

---

### 10. ARCHIVIST (Historical Records)
**Reports To:** Scribe  
**Role:** Long-term Storage  

**Responsibilities:**
- Archive completed projects
- Maintain changelog
- Create quarterly summaries
- Organize repository structure

**Autonomous:** Yes, purely maintenance tasks

---

## Technology Stack Recommendation

### Option 1: Inngest + Supabase (RECOMMENDED)

**Inngest:**
- Event-driven workflows perfect for agent coordination
- Built-in scheduling for cron-like tasks
- Retry logic and error handling
- Visual workflow debugging
- Function chaining for complex agent interactions

**Supabase:**
- PostgreSQL for agent state storage
- Real-time subscriptions for agent coordination
- Row-level security for agent permissions
- Built-in auth if needed for dial.wtf integration

**Why This Combo:**
- Inngest handles orchestration and timing
- Supabase provides shared state and database
- Both have generous free tiers
- TypeScript-first for easy integration

**Architecture:**
```
GitHub Actions Trigger
  → Inngest Event
    → Agent Function (e.g., operator.executeTask)
      → Supabase (read/write state)
      → Sub-agent Functions (parallel execution)
    → Report back to Signer
      → Log to GitHub via Scribe
```

---

### Option 2: Mastra

**Pros:**
- Purpose-built for AI agents
- Built-in agent memory and state management
- Pre-built integrations with LLM providers
- Agent-to-agent communication primitives

**Cons:**
- Newer framework, smaller ecosystem
- Less flexibility for custom workflows
- May be overkill for simpler tasks

**Best For:** If agents need complex LLM reasoning at every step

---

### Option 3: Pure GitHub Actions + Supabase

**Pros:**
- No additional platform dependencies
- Already using GitHub Actions
- Simple to understand

**Cons:**
- Limited orchestration capabilities
- Hard to coordinate complex agent interactions
- No visual workflow debugging

**Best For:** MVP / proof of concept

---

## Implementation Plan

### Phase 1: Foundation (Day 1-3)
1. Set up Inngest account and workspace
2. Set up Supabase project
3. Create agent state schema in Supabase:
   ```sql
   CREATE TABLE agents (
     id UUID PRIMARY KEY,
     name TEXT NOT NULL,
     role TEXT NOT NULL,
     status TEXT, -- active, idle, error
     last_active TIMESTAMP,
     config JSONB
   );
   
   CREATE TABLE tasks (
     id UUID PRIMARY KEY,
     agent_id UUID REFERENCES agents(id),
     type TEXT NOT NULL,
     status TEXT, -- pending, in_progress, completed, failed
     payload JSONB,
     result JSONB,
     created_at TIMESTAMP,
     completed_at TIMESTAMP
   );
   
   CREATE TABLE reports (
     id UUID PRIMARY KEY,
     agent_id UUID REFERENCES agents(id),
     report_type TEXT,
     content JSONB,
     created_at TIMESTAMP
   );
   ```

### Phase 2: Core Agents (Day 4-7)
1. Implement OPERATOR
   - GitHub Issue handler
   - Task dispatcher
   - Status updater

2. Implement SCRIBE
   - Daily log generator
   - Documentation updater
   - Report compiler

3. Implement SCOUT
   - Issue monitor
   - Research gatherer

### Phase 3: Validation Layer (Day 8-14)
1. Implement AUDITOR
   - Code review automation
   - Security scanning
   - Treasury validation

2. Implement ANALYST
   - Metrics tracking
   - Financial calculations

### Phase 4: Communication (Day 15-21)
1. Implement COURIER
   - GitHub comment responder
   - Notification system

2. Implement HERALD
   - Content generator
   - Announcement drafter

### Phase 5: Full Autonomy (Day 22-30)
1. Fine-tune agent interactions
2. Optimize approval workflows
3. Scale to handle multiple concurrent tasks
4. Measure performance vs. doubling challenge

---

## Agent Communication Protocol

All agents communicate through a structured message format:

```typescript
interface AgentMessage {
  from: AgentId;
  to: AgentId | 'signer';
  type: 'request' | 'report' | 'alert' | 'approval_needed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  payload: {
    action?: string;
    data?: any;
    context?: string;
  };
  timestamp: string;
}
```

**Example: Scout finds a service request**
```json
{
  "from": "agent-scout",
  "to": "agent-operator",
  "type": "report",
  "priority": "medium",
  "payload": {
    "action": "new_service_request",
    "data": {
      "issue_id": 42,
      "service_type": "nonce_analysis",
      "client": "@username"
    },
    "context": "Free tier request, looks legitimate"
  },
  "timestamp": "2026-01-18T00:15:00Z"
}
```

---

## Approval Workflow

For actions requiring Signer approval:

1. Agent prepares action
2. Agent creates approval request in Supabase
3. Agent sends message to Signer
4. **Human (Jonah) reviews** via GitHub Issue or dashboard
5. Approval granted → Agent executes
6. Approval denied → Agent logs and reports

All approvals are logged in `/logs/approvals/`

---

## Success Metrics

### Agent Performance KPIs
- **Response Time:** <5 min for Scout to detect new Issues
- **Accuracy:** >95% for Auditor vulnerability detection
- **Uptime:** 99%+ for all agents
- **Approval Latency:** <2 hours for Signer review

### Business KPIs
- **Service Request Volume:** Track inquiries per day
- **Conversion Rate:** % of requests → paid engagements
- **Revenue Growth:** Daily doubling challenge tracking
- **Client Satisfaction:** GitHub Issue feedback

---

## Security & Constraints

### Agent Permissions
- **OPERATOR:** Can create branches, cannot merge to main
- **AUDITOR:** Read-only on code, can create Issues
- **SCRIBE:** Can commit to `/logs/` and `/docs/`, nothing else
- **Scout/Courier/Others:** Read-only + specific write paths

### Human Gates (Always Required)
1. Financial transactions >0.05 ETH
2. Code merges to main branch
3. Publishing audit reports
4. Public communications (until proven reliable)
5. Major strategic decisions

---

## Next Steps

1. **Jonah:** Approve this architecture
2. **Signer:** Set up Inngest + Supabase accounts
3. **Operator:** Create first agent (operator.ts)
4. **Scribe:** Log agent deployment in day-01.md
5. **All Agents:** Report to Signer for first dispatch

---

## Appendix: Agent Personalities (for LLM prompts)

### OPERATOR
> "Task received. Analyzing scope. Estimated completion: 2 hours. Will report when done."

### AUDITOR
> "Critical vulnerability detected in line 47. Transaction halted pending Signer review."

### SCRIBE
> "Day 1 log updated. 3 new service requests documented. Treasury: 1.0 → 1.2 (pending)."

### SCOUT
> "Monitoring 5 new GitHub Issues. 2 match our service offerings. Operator notified."

### COURIER
> "Draft response prepared for Issue #42. Awaiting Operator approval before posting."

---

_"A syndicate is only as strong as its weakest link. Every agent matters."_  
— The Signer v0.1
