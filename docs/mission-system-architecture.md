# Mission System Visual Architecture

## High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS MISSION LOOP                      │
└─────────────────────────────────────────────────────────────────┘

Every 30 Minutes
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│           SIGNER ORCHESTRATOR (Inngest Function)                │
│                                                                  │
│  1. Query missions table (pending, assigned_to='signer')        │
│     └─ Order by priority DESC, created_at ASC                  │
│                                                                  │
│  2. If mission found:                                           │
│     ├─ Mark as IN_PROGRESS                                     │
│     ├─ Prepare signer_context                                  │
│     ├─ Log mission briefing                                    │
│     └─ Return to Inngest for execution                         │
│                                                                  │
│  3. If no mission:                                              │
│     └─ Create default autonomous health check task             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┴──────────────────┐
         ▼                                    ▼
    ┌─────────────┐              ┌──────────────────────┐
    │  SIGNER     │              │  NEXT 30 MINUTES     │
    │  EXECUTION  │              │  (Orchestrator waits)│
    │ (Manual/Auto)              │                      │
    └─────────────┘              └──────────────────────┘
         │
         ├─ Executes mission
         ├─ Logs to mission_logs
         ├─ Updates signer_context
         ├─ Takes actions (wallet ops, etc.)
         │
         ▼
    ┌─────────────────────────────────────────┐
    │  MISSION COMPLETE                       │
    │  • Update status                         │
    │  • Store results in mission_results      │
    │  • Record performance metrics            │
    │  • Ready for next cycle                  │
    └─────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
                      ┌─────────────────┐
                      │   WEB INTERFACE │
                      │  (Create/Query) │
                      └────────┬────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
            ▼                                     ▼
    ┌───────────────┐               ┌────────────────────┐
    │   MISSIONS    │               │  MISSION LOGS      │
    │    TABLE      │◄──────────────│  (Execution Trail) │
    └───────────────┘               └────────────────────┘
            ▲                                     ▲
            │                                     │
            │  ┌──────────────────────────────────┤
            │  │                                  │
    ┌───────────────────────────────────────────────────────┐
    │                                                       │
    │      SIGNER ORCHESTRATOR (Every 30 minutes)          │
    │                                                       │
    │  1. SELECT FROM missions (pending)                   │
    │  2. CREATE/UPDATE signer_context                     │
    │  3. INSERT INTO mission_logs (briefing)              │
    │  4. Trigger execution                                │
    │                                                       │
    └─────┬───────────────────────────────────────────────┬┘
          │                                               │
          ▼                                               ▼
    ┌────────────────────────────┐         ┌────────────────────────┐
    │    SIGNER EXECUTION        │         │  SIGNER CONTEXT        │
    │                            │         │  (Conversation History)│
    │  • Parse objectives        │         │                        │
    │  • Execute wallet ops      │────────→│  • Add messages        │
    │  • Track costs             │         │  • Add actions         │
    │  • Log progress            │         │  • Update state        │
    │                            │         │                        │
    └────────────────────────────┘         └────────────────────────┘
          │
          │  Logs execution steps
          │
          ▼
    ┌────────────────────────────┐
    │   MISSION LOGS TABLE       │
    │                            │
    │  • INFO: Started mission   │
    │  • DEBUG: Processing X     │
    │  • INFO: Action executed   │
    │  • ERROR: (if any)         │
    │                            │
    └────────────────────────────┘
          │
          │  On completion
          │
          ▼
    ┌────────────────────────────┐
    │   MISSION RESULTS          │
    │                            │
    │  • outcome: success        │
    │  • results: {...}          │
    │  • cost_usd: 3.50          │
    │  • execution_time_seconds: │
    │                            │
    └────────────────────────────┘
          │
          │  Update mission
          │
          ▼
    ┌────────────────────────────┐
    │   MISSIONS (updated)       │
    │                            │
    │  status: completed         │
    │  completed_at: now()       │
    │                            │
    └────────────────────────────┘
```

---

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ┌──────────────────┐                        │
│                    │  MISSIONS        │                        │
│                    ├──────────────────┤                        │
│                    │ id (PK)          │                        │
│                    │ title            │                        │
│                    │ priority         │                        │
│                    │ status           │                        │
│                    │ context (JSONB)  │                        │
│                    │ assigned_to      │                        │
│                    │ created_at       │                        │
│                    │ started_at       │                        │
│                    │ completed_at     │                        │
│                    └────────┬─────────┘                        │
│                             │ 1                                │
│          ┌──────────────────┼──────────────────┐              │
│          │ (FK)             │ (FK)             │ (FK)          │
│          │ mission_id       │ mission_id       │ mission_id    │
│          ▼                  ▼                  ▼              │
│    ┌──────────────┐  ┌────────────────┐ ┌──────────────┐    │
│    │SIGNER_CONTEXT│  │MISSION_RESULTS│ │MISSION_LOGS │    │
│    ├──────────────┤  ├────────────────┤ ├──────────────┤    │
│    │ id           │  │ id             │ │ id           │    │
│    │ mission_id   │  │ mission_id     │ │ mission_id   │    │
│    │ conversation │  │ outcome        │ │ level        │    │
│    │ actions_taken│  │ results (JSON) │ │ message      │    │
│    │ current_state│  │ cost_usd       │ │ context      │    │
│    │ created_at   │  │ completed_at   │ │ created_at   │    │
│    └──────────────┘  └────────────────┘ └──────────────┘    │
│          │                                      │             │
│          │                   ┌──────────────────┘             │
│          │                   │                               │
│          │              M rows (many logs per mission)        │
│          │                                                    │
│          └────────────── VIEWS ──────────────────┐           │
│                                                  │           │
│                        ┌───────────────────────┬─┴───┐        │
│                        ▼                       ▼     │        │
│                  ┌──────────────┐      ┌────────────┴──┐     │
│                  │MISSION_SUMMARY│      │MISSION_STATS │     │
│                  ├──────────────┤      ├────────────────┤    │
│                  │ Combined view │      │ Aggregated    │    │
│                  │ all details   │      │ statistics    │    │
│                  │ + log count   │      │ by agent/status
│                  └──────────────┘      └────────────────┘    │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Mission Priority & Routing

```
┌─────────────────────────────────────────────────┐
│         MISSION INTAKE SYSTEM                   │
└─────────────────────────────────────────────────┘

        Mission Created
               │
               ▼
        ┌──────────────┐
        │ SET PRIORITY │
        └──────┬───────┘
               │
    ┌──────────┼──────────┬────────────┐
    │          │          │            │
    ▼          ▼          ▼            ▼
┌────────┐┌────────┐┌───────┐┌──────────┐
│ LOW    ││MEDIUM  ││ HIGH  ││CRITICAL  │
│  QUEUE ││ QUEUE  ││ QUEUE ││  QUEUE   │
└────┬───┘└───┬────┘└───┬───┘└─────┬────┘
     │        │        │          │
     │        │        │     (picked first)
     │        │    (picked second)
     │   (picked third)
     (picked last)
     │
     └─────────────────────────────────┐
                                       │
        ┌──────────────────────────────┘
        │
        ▼
  ┌─────────────────────────────────────┐
  │  SIGNER ORCHESTRATOR SELECTS:       │
  │                                     │
  │  ORDER BY priority DESC,            │
  │           created_at ASC            │
  │                                     │
  │  Result: One mission to execute     │
  └─────────────────────────────────────┘
        │
        ▼
  ┌─────────────────────────────────────┐
  │  MARK AS IN_PROGRESS                │
  │  STATUS: pending → in_progress      │
  │  started_at: now()                  │
  └─────────────────────────────────────┘
        │
        ▼
  ┌─────────────────────────────────────┐
  │  PREPARE FOR SIGNER                 │
  │  - Load context                     │
  │  - Get conversation history         │
  │  - Set up workspace                 │
  └─────────────────────────────────────┘
        │
        ▼
  ┌─────────────────────────────────────┐
  │  SIGNER EXECUTES                    │
  │  (Manual or Perplexity scheduled)   │
  └─────────────────────────────────────┘
```

---

## Mission Logging Flow

```
┌─────────────────────────────────────────────────┐
│  MISSION EXECUTION WITH LOGGING                 │
└─────────────────────────────────────────────────┘

Start Mission
     │
     ├─ MissionLogger.info('Started')
     │  └─ INSERT mission_logs (level=INFO)
     │
     ├─ Execute Step 1
     │  └─ MissionLogger.addAction('step1', 'result')
     │     └─ UPDATE signer_context (actions_taken)
     │
     ├─ Execute Step 2
     │  └─ MissionLogger.addMessage(role, content)
     │     └─ UPDATE signer_context (conversation)
     │
     ├─ Execute Step 3 (with cost)
     │  └─ MissionLogger.addAction('step3', 'result', cost=2.50)
     │
     ├─ If Error
     │  └─ MissionLogger.error('Error message')
     │     └─ INSERT mission_logs (level=ERROR)
     │
     └─ On Completion
        └─ MissionLogger.complete(
             outcome='success',
             summary='Did X',
             results={...},
             cost_usd=3.50,
             execution_time_seconds=120
           )
           ├─ UPDATE missions (status=completed, completed_at)
           ├─ INSERT mission_results (outcome, results, cost)
           └─ INSERT mission_logs (level=INFO, 'completed')

Result: Full execution trace in database
```

---

## Query Optimization Indices

```
┌────────────────────────────────────────────────────┐
│         INDICES FOR PERFORMANCE                    │
└────────────────────────────────────────────────────┘

missions table:
  • idx_missions_status
    → For: WHERE status = 'pending'
    
  • idx_missions_priority
    → For: ORDER BY priority DESC
    
  • idx_missions_status_priority (COMPOSITE)
    → For: WHERE status='pending' ORDER BY priority
    
  • idx_missions_assigned_to
    → For: WHERE assigned_to = 'signer'
    
  • idx_missions_created_at
    → For: ORDER BY created_at DESC

signer_context table:
  • idx_signer_context_mission_id
    → For: Quick context lookup
    
  • idx_signer_context_created_at
    → For: Latest context retrieval

mission_logs table:
  • idx_mission_logs_mission_id
    → For: Get all logs for mission
    
  • idx_mission_logs_level
    → For: Find errors/warnings quickly

Result: < 100ms queries even with large datasets
```

---

## Real-Time Monitoring Dashboard (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                  MISSION DASHBOARD                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Active Missions (3)  ┌─ Statistics                     │
│  │ • Health Audit (HIGH) │ Completed: 45                  │
│  │ • Revenue Scan (MED)  │ Failed: 2                      │
│  │ • Code Review (MED)   │ In Progress: 3                 │
│  └───────────────────────┤ Success Rate: 95.7%            │
│                          │ Avg Cost: $4.23                │
│  ┌─ Recent Logs          │ Avg Time: 87s                 │
│  │ [INFO] Started        └────────────────────────────────┘
│  │ [INFO] Scanning DEX
│  │ [DEBUG] Found 5 pools │ ┌─ By Agent Type
│  │ [INFO] Analysis done  │ │ Signer: 12 total
│  │ [ERROR] Cost exceeded │ │ Operator: 8 total
│  └───────────────────────┤ Researcher: 15 total
│                          │ Scribe: 5 total
│  ┌─ Next Mission Queued  └────────────────────────────────┘
│  │ → Opportunity Scan
│  │   Priority: CRITICAL  ┌─ Real-Time Updates
│  │   ETA: < 5 min        │ WebSocket: Connected ✓
│  └───────────────────────┤ Auto-refresh: 5s
│                          │ Last sync: 2s ago
│                          └────────────────────────────────┘
│
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

The Mission System provides:

1. **Orchestration** - Signer runs every 30 minutes
2. **Queuing** - Priority-based mission selection
3. **Logging** - Complete execution audit trail
4. **Context** - Conversation and action history
5. **Results** - Outcome tracking and metrics
6. **Monitoring** - Real-time dashboard visibility

All components are designed for:
- **Scalability** - Handle thousands of missions
- **Reliability** - Transaction safety and consistency
- **Observability** - Comprehensive logging and metrics
- **Autonomy** - Self-managing mission loop
