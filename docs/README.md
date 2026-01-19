# Mission System Documentation Index

## 📚 Complete Guide to the Mission System

### Quick Start (Start Here!)
**→ [Mission System Summary](../MISSION_SYSTEM_SUMMARY.md)**
- Overview of everything built
- 3-step quick start
- File structure

---

## 📖 Comprehensive Guides

### 1. Full Setup Guide
**→ [mission-system-setup.md](mission-system-setup.md)**
- Architecture overview
- Step-by-step setup
- Database schema explained
- Common queries
- Debugging guide
- Performance tips

**Read this if:** Setting up the system for the first time

### 2. Quick Reference
**→ [mission-quick-reference.md](mission-quick-reference.md)**
- Common queries (copy-paste)
- Table reference
- Mission status flow
- Priority definitions
- Debug checklist
- Manual actions

**Read this if:** You need a quick query or common command

### 3. Architecture & Design
**→ [mission-system-architecture.md](mission-system-architecture.md)**
- High-level flow diagrams
- Data flow visualization
- Schema relationships
- Database indices
- Query optimization
- Real-time dashboard mockup

**Read this if:** You want to understand the system design

### 4. Implementation Checklist
**→ [mission-implementation-checklist.md](mission-implementation-checklist.md)**
- Phase-by-phase breakdown
- Task tracking
- Pre-deployment checklist
- Timeline estimate
- Current status
- Next steps

**Read this if:** You're tracking progress or planning the next phase

---

## 💻 Technical Reference

### Database Migration
**→ [migrations/001_create_missions_schema.sql](migrations/001_create_missions_schema.sql)**
- Complete SQL schema
- Table definitions
- Indices
- Views
- Constraints

**Use this to:** Set up the database in Supabase

### TypeScript Types
**→ [../src/types/missions.ts](../src/types/missions.ts)**
- Mission interface
- SignerContext interface
- MissionResult interface
- MissionLog interface
- Request/Response DTOs
- Filter interfaces

**Use this for:** Type definitions in your code

### Mission Logger
**→ [../src/inngest/mission-logger.ts](../src/inngest/mission-logger.ts)**
- Logging utility class
- 8+ methods
- Usage examples
- Error handling

**Use this to:** Log mission execution

### Seed Script
**→ [../src/scripts/seed-missions.ts](../src/scripts/seed-missions.ts)**
- 10 test missions
- Data structure
- How to customize

**Use this to:** Populate test data

### Signer Orchestrator
**→ [../src/inngest/functions/signer-orchestrator.ts](../src/inngest/functions/signer-orchestrator.ts)**
- Main orchestration function
- Mission selection logic
- Context preparation
- Ready for wallet operations

**Use this to:** Implement wallet operations

---

## 🎯 Use Cases

### "I want to set up the system"
1. Read: [mission-system-setup.md](mission-system-setup.md) - Setup Steps section
2. Run migration from: [migrations/001_create_missions_schema.sql](migrations/001_create_missions_schema.sql)
3. Run: `npx ts-node src/scripts/seed-missions.ts`
4. Monitor in Inngest dashboard

### "I need a quick database query"
1. Go to: [mission-quick-reference.md](mission-quick-reference.md)
2. Find your query in "Common Queries"
3. Copy and customize

### "I need to understand the design"
1. Read: [mission-system-architecture.md](mission-system-architecture.md)
2. Study the flow diagrams
3. Review the schema relationships

### "I'm implementing the wallet operations"
1. Open: [../src/inngest/functions/signer-orchestrator.ts](../src/inngest/functions/signer-orchestrator.ts)
2. Import: `MissionLogger` from [../src/inngest/mission-logger.ts](../src/inngest/mission-logger.ts)
3. Use: `MissionLogger.info()`, `.addAction()`, `.complete()`
4. Reference examples in mission-logger.ts

### "Something's broken, I need to debug"
1. Check: [mission-system-setup.md](mission-system-setup.md) - Monitoring & Debugging section
2. Query: [mission-quick-reference.md](mission-quick-reference.md) - Debugging section
3. Run: The SQL queries to diagnose issues

### "I want to track my progress"
1. Open: [mission-implementation-checklist.md](mission-implementation-checklist.md)
2. Check phases and current status
3. Update as you complete tasks

---

## 📊 Decision Trees

### "Which document should I read?"

```
START
  │
  ├─ "I'm new to this system"
  │  └─ → MISSION_SYSTEM_SUMMARY.md
  │
  ├─ "I need to set this up"
  │  └─ → mission-system-setup.md
  │
  ├─ "I need a quick query"
  │  └─ → mission-quick-reference.md
  │
  ├─ "I want to understand the design"
  │  └─ → mission-system-architecture.md
  │
  ├─ "I'm tracking tasks/progress"
  │  └─ → mission-implementation-checklist.md
  │
  └─ "I need to find something specific"
     └─ → Use Ctrl+F to search all documents
```

---

## 🔄 Document Map

```
ENTRY POINTS:
  ├─ MISSION_SYSTEM_SUMMARY.md ─────► Overview (read first!)
  │
  └─ mission-*.md documents
     ├─ mission-system-setup.md ─────► How to set up
     ├─ mission-quick-reference.md ─► Quick lookups
     ├─ mission-system-architecture.md─► Design docs
     └─ mission-implementation-checklist.md─► Task tracking

CODE FILES:
  ├─ migrations/001_create_missions_schema.sql ─► Database setup
  ├─ ../src/types/missions.ts ───────────────► Type definitions
  ├─ ../src/inngest/mission-logger.ts ───────► Logging
  ├─ ../src/scripts/seed-missions.ts ────────► Test data
  └─ ../src/inngest/functions/signer-orchestrator.ts ─► Main logic
```

---

## ⚡ Common Tasks

### Setup the system (first time)
1. [mission-system-setup.md](mission-system-setup.md) - Step 1-3
2. Migration: [migrations/001_create_missions_schema.sql](migrations/001_create_missions_schema.sql)
3. Seed: `npx ts-node src/scripts/seed-missions.ts`

### Check mission status
```sql
-- From: mission-quick-reference.md
SELECT * FROM missions ORDER BY created_at DESC LIMIT 10;
```

### Log mission progress
```typescript
// From: ../src/inngest/mission-logger.ts
import { MissionLogger } from '@/src/inngest/mission-logger';
await MissionLogger.info(missionId, 'Progress message');
```

### Debug issues
→ See: [mission-system-setup.md](mission-system-setup.md) - Monitoring & Debugging section

### Understand data flow
→ See: [mission-system-architecture.md](mission-system-architecture.md) - Data Flow Diagram

---

## 🎓 Learning Path

### Day 1: Understand
1. Read: [MISSION_SYSTEM_SUMMARY.md](../MISSION_SYSTEM_SUMMARY.md)
2. Read: [mission-system-architecture.md](mission-system-architecture.md)
3. **Time: 45 minutes**

### Day 2: Set Up
1. Follow: [mission-system-setup.md](mission-system-setup.md) - Setup Steps
2. Run seed script
3. Verify in Supabase
4. **Time: 20 minutes**

### Day 3: Implement
1. Open: `src/inngest/functions/signer-orchestrator.ts`
2. Reference: `src/inngest/mission-logger.ts`
3. Implement wallet operations
4. **Time: 2-3 hours**

### Day 4: Monitor
1. Query: [mission-quick-reference.md](mission-quick-reference.md)
2. Build dashboard (optional)
3. Set up alerts
4. **Time: 1-2 hours**

---

## 📞 Quick Links

| Need | Go To |
|------|-------|
| Get started | [MISSION_SYSTEM_SUMMARY.md](../MISSION_SYSTEM_SUMMARY.md) |
| Set up system | [mission-system-setup.md](mission-system-setup.md) |
| Quick query | [mission-quick-reference.md](mission-quick-reference.md) |
| Understand design | [mission-system-architecture.md](mission-system-architecture.md) |
| Track progress | [mission-implementation-checklist.md](mission-implementation-checklist.md) |
| Database schema | [migrations/001_create_missions_schema.sql](migrations/001_create_missions_schema.sql) |
| Type definitions | [../src/types/missions.ts](../src/types/missions.ts) |
| Logger usage | [../src/inngest/mission-logger.ts](../src/inngest/mission-logger.ts) |
| Test missions | [../src/scripts/seed-missions.ts](../src/scripts/seed-missions.ts) |
| Main function | [../src/inngest/functions/signer-orchestrator.ts](../src/inngest/functions/signer-orchestrator.ts) |

---

## ✅ Verification Checklist

Before you start, verify:
- [ ] You can access Supabase dashboard
- [ ] You have TypeScript/Node.js installed
- [ ] You can run npm commands
- [ ] You have access to Inngest dashboard
- [ ] All documentation files exist

---

## 🚀 Ready to Start?

**Start here:** [MISSION_SYSTEM_SUMMARY.md](../MISSION_SYSTEM_SUMMARY.md)

Then follow the "Quick Start (3 Steps)" section.

---

## 📞 Need Help?

1. **Setup issues?** → [mission-system-setup.md](mission-system-setup.md) - Troubleshooting
2. **Query question?** → [mission-quick-reference.md](mission-quick-reference.md)
3. **Design question?** → [mission-system-architecture.md](mission-system-architecture.md)
4. **Task tracking?** → [mission-implementation-checklist.md](mission-implementation-checklist.md)

---

Last Updated: January 19, 2026
