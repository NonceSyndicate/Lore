-- Migration: Mission Results, GitHub Tracking, and Audit Trail
-- Version: 003
-- Date: 2026-01-21
-- Purpose: Add mission completion tracking, GitHub integration, and comprehensive audit trail

-- 1. Enhance mission_results table with more detailed tracking
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
  
  -- Deliverables tracking
  deliverables JSONB DEFAULT '[]'::jsonb,
  
  -- GitHub tracking
  github_commits JSONB DEFAULT '[]'::jsonb,
  github_prs JSONB DEFAULT '[]'::jsonb,
  github_branches TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Revenue and metrics
  revenue_usd NUMERIC DEFAULT 0,
  metrics JSONB DEFAULT '{}'::jsonb,
  
  -- Audit trail
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_by TEXT
);

-- 2. Create mission_deliverables table
CREATE TABLE IF NOT EXISTS mission_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  
  -- Deliverable metadata
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL CHECK (type IN ('code', 'document', 'analysis', 'report', 'other')),
  
  -- Content and tracking
  content TEXT,
  file_path VARCHAR(512),
  file_size_bytes BIGINT,
  
  -- GitHub reference
  github_url VARCHAR(512),
  github_commit_hash VARCHAR(40),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT DEFAULT 'agent'
);

CREATE INDEX IF NOT EXISTS idx_mission_deliverables_mission ON mission_deliverables(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_deliverables_status ON mission_deliverables(status);

-- 3. Create github_commits table for audit trail
CREATE TABLE IF NOT EXISTS github_commits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  
  -- Commit details
  commit_hash VARCHAR(40) NOT NULL,
  branch_name VARCHAR(255),
  commit_message TEXT NOT NULL,
  
  -- Author info
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  
  -- Changes
  files_changed INTEGER,
  insertions INTEGER,
  deletions INTEGER,
  
  -- Reference to deliverable
  deliverable_id UUID REFERENCES mission_deliverables(id),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  committed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_github_commits_mission ON github_commits(mission_id);
CREATE INDEX IF NOT EXISTS idx_github_commits_hash ON github_commits(commit_hash);
CREATE INDEX IF NOT EXISTS idx_github_commits_branch ON github_commits(branch_name);

-- 4. Create github_prs table
CREATE TABLE IF NOT EXISTS github_prs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  
  -- PR details
  pr_number INTEGER NOT NULL,
  pr_url VARCHAR(512) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Branch info
  source_branch VARCHAR(255),
  target_branch VARCHAR(255),
  
  -- Status
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'merged', 'closed', 'draft')),
  
  -- Metrics
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  changed_files INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  merged_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_github_prs_mission ON github_prs(mission_id);
CREATE INDEX IF NOT EXISTS idx_github_prs_number ON github_prs(pr_number);
CREATE INDEX IF NOT EXISTS idx_github_prs_status ON github_prs(status);

-- 5. Create mission_audit_trail table for comprehensive tracking
CREATE TABLE IF NOT EXISTS mission_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  
  -- Event tracking
  event_type VARCHAR(100) NOT NULL CHECK (
    event_type IN (
      'created', 'started', 'updated', 'completed', 'failed',
      'github_commit', 'github_pr_created', 'github_pr_merged',
      'file_created', 'file_modified', 'code_generated',
      'revenue_tracked', 'agent_action'
    )
  ),
  
  -- Event details
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Authorship
  agent_name VARCHAR(100),
  user_name VARCHAR(255),
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mission_audit_mission ON mission_audit_trail(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_audit_event_type ON mission_audit_trail(event_type);
CREATE INDEX IF NOT EXISTS idx_mission_audit_created ON mission_audit_trail(created_at DESC);

-- 6. Create mission_metrics table for revenue and performance tracking
CREATE TABLE IF NOT EXISTS mission_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  
  -- Revenue tracking
  revenue_category VARCHAR(100) NOT NULL,
  amount_usd NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  
  -- Performance metrics
  metric_name VARCHAR(100),
  metric_value NUMERIC,
  
  -- Date tracking
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_mission_metrics_mission ON mission_metrics(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_metrics_category ON mission_metrics(revenue_category);

-- 7. Create enhanced mission_logs with more detail
ALTER TABLE mission_logs ADD COLUMN IF NOT EXISTS agent_name VARCHAR(100);
ALTER TABLE mission_logs ADD COLUMN IF NOT EXISTS action VARCHAR(255);
ALTER TABLE mission_logs ADD COLUMN IF NOT EXISTS details JSONB;

-- 8. Create view for mission execution summary
CREATE OR REPLACE VIEW mission_execution_summary AS
SELECT 
  m.id,
  m.title,
  m.priority,
  m.status,
  m.assigned_to,
  COUNT(DISTINCT ml.id) as log_entries,
  COUNT(DISTINCT md.id) as deliverables,
  COUNT(DISTINCT gc.id) as github_commits,
  COUNT(DISTINCT gp.id) as github_prs,
  COALESCE(mr.outcome, 'pending') as outcome,
  COALESCE(mr.execution_time_seconds, 0) as execution_time,
  COALESCE(mr.cost_usd, 0) as cost_usd,
  COALESCE(mr.revenue_usd, 0) as revenue_usd,
  m.created_at,
  m.started_at,
  m.completed_at
FROM missions m
LEFT JOIN mission_logs ml ON m.id = ml.mission_id
LEFT JOIN mission_deliverables md ON m.id = md.mission_id
LEFT JOIN github_commits gc ON m.id = gc.mission_id
LEFT JOIN github_prs gp ON m.id = gp.mission_id
LEFT JOIN mission_results mr ON m.id = mr.mission_id
GROUP BY m.id, m.title, m.priority, m.status, m.assigned_to, 
         mr.outcome, mr.execution_time_seconds, mr.cost_usd, mr.revenue_usd;

-- 9. Create view for agent performance
CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT 
  m.assigned_to as agent,
  COUNT(m.id) as total_missions,
  COUNT(CASE WHEN m.status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN m.status = 'failed' THEN 1 END) as failed,
  ROUND(COUNT(CASE WHEN m.status = 'completed' THEN 1 END)::numeric / 
        NULLIF(COUNT(m.id), 0) * 100, 2) as success_rate,
  COALESCE(AVG(EXTRACT(EPOCH FROM (m.completed_at - m.started_at))), 0) as avg_execution_time_seconds,
  COALESCE(SUM(mr.revenue_usd), 0) as total_revenue_usd,
  COALESCE(COUNT(DISTINCT gc.id), 0) as total_commits,
  COALESCE(COUNT(DISTINCT gp.id), 0) as total_prs
FROM missions m
LEFT JOIN mission_results mr ON m.id = mr.mission_id
LEFT JOIN github_commits gc ON m.id = gc.mission_id
LEFT JOIN github_prs gp ON m.id = gp.mission_id
WHERE m.assigned_to IS NOT NULL
GROUP BY m.assigned_to;

-- 10. Enable realtime subscriptions for dashboard
ALTER TABLE missions REPLICA IDENTITY FULL;
ALTER TABLE mission_results REPLICA IDENTITY FULL;
ALTER TABLE mission_logs REPLICA IDENTITY FULL;
ALTER TABLE mission_deliverables REPLICA IDENTITY FULL;
ALTER TABLE github_commits REPLICA IDENTITY FULL;
ALTER TABLE github_prs REPLICA IDENTITY FULL;

-- Verify schema
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name IN (
  'mission_results', 'mission_deliverables', 'github_commits', 
  'github_prs', 'mission_audit_trail', 'mission_metrics', 'mission_logs'
)
GROUP BY table_name
ORDER BY table_name;
