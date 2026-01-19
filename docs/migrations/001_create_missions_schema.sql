-- Migration: Create Missions and Signer Context Schema
-- Version: 001
-- Date: 2026-01-19
-- Purpose: Set up autonomous mission system for Signer Orchestrator

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create missions table
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  
  -- Mission context (JSON for flexibility)
  context JSONB NOT NULL DEFAULT '{
    "objectives": [],
    "tools_available": [],
    "budget_limit_usd": 0,
    "autonomous": true
  }'::jsonb,
  
  -- Assignment and execution
  assigned_to TEXT NOT NULL DEFAULT 'signer' CHECK (assigned_to IN ('signer', 'operator', 'researcher', 'scribe')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_by TEXT DEFAULT 'system',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT mission_lifecycle CHECK (
    (status = 'pending' AND started_at IS NULL) OR
    (status IN ('in_progress', 'completed', 'failed') AND started_at IS NOT NULL)
  )
);

-- Create signer_context table for conversation and action history
CREATE TABLE IF NOT EXISTS signer_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  
  -- Conversation history with the Signer
  conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Actions taken during mission execution
  actions_taken JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Current execution state
  current_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  version INTEGER DEFAULT 1,
  
  CONSTRAINT valid_conversation CHECK (jsonb_typeof(conversation_history) = 'array'),
  CONSTRAINT valid_actions CHECK (jsonb_typeof(actions_taken) = 'array')
);

-- Create mission_results table for storing final outcomes
CREATE TABLE IF NOT EXISTS mission_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL UNIQUE REFERENCES missions(id) ON DELETE CASCADE,
  
  -- Execution summary
  summary TEXT,
  outcome TEXT CHECK (outcome IN ('success', 'partial', 'failed', 'abandoned')),
  
  -- Detailed results
  results JSONB DEFAULT '{}'::jsonb,
  errors JSONB DEFAULT '{}'::jsonb,
  
  -- Performance metrics
  execution_time_seconds NUMERIC,
  cost_usd NUMERIC DEFAULT 0,
  
  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mission_logs table for detailed execution logs
CREATE TABLE IF NOT EXISTS mission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  
  -- Log entry
  level TEXT NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR')),
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_priority ON missions(priority);
CREATE INDEX IF NOT EXISTS idx_missions_assigned_to ON missions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON missions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_missions_status_priority ON missions(status, priority DESC);

CREATE INDEX IF NOT EXISTS idx_signer_context_mission_id ON signer_context(mission_id);
CREATE INDEX IF NOT EXISTS idx_signer_context_created_at ON signer_context(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mission_results_mission_id ON mission_results(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_logs_mission_id ON mission_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_logs_level ON mission_logs(level);

-- Create views for monitoring
CREATE OR REPLACE VIEW mission_summary AS
SELECT 
  m.id,
  m.title,
  m.priority,
  m.status,
  m.assigned_to,
  m.created_at,
  m.started_at,
  m.completed_at,
  COUNT(ml.id) as log_count,
  MAX(ml.created_at) as last_log_at
FROM missions m
LEFT JOIN mission_logs ml ON m.id = ml.mission_id
GROUP BY m.id, m.title, m.priority, m.status, m.assigned_to, m.created_at, m.started_at, m.completed_at;

CREATE OR REPLACE VIEW mission_stats AS
SELECT 
  assigned_to,
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_execution_seconds
FROM missions
WHERE started_at IS NOT NULL
GROUP BY assigned_to, status;

-- Enable Row Level Security (RLS) - optional, for multi-tenant support
-- ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE signer_context ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mission_results ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mission_logs ENABLE ROW LEVEL SECURITY;
