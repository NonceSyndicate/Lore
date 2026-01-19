-- Fix hierarchical mission/task structure
-- Missions → Tasks → Subtasks
-- This establishes proper parent-child relationships

-- 1. Create agent_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES agent_tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  assigned_to VARCHAR(100),
  order_index INT DEFAULT 0,
  dependencies JSONB DEFAULT '[]'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_agent_tasks_mission ON agent_tasks(mission_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_parent ON agent_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_priority ON agent_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_assigned ON agent_tasks(assigned_to);

-- 3. Create task_logs table for task-level audit trail
CREATE TABLE IF NOT EXISTS task_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
  agent_type VARCHAR(100),
  level VARCHAR(20) DEFAULT 'INFO' CHECK (level IN ('INFO', 'WARN', 'ERROR', 'DEBUG')),
  action VARCHAR(255),
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_logs_task ON task_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_agent ON task_logs(agent_type);
CREATE INDEX IF NOT EXISTS idx_task_logs_created ON task_logs(created_at DESC);

-- 4. Create task_results table for execution output
CREATE TABLE IF NOT EXISTS task_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  agent_type VARCHAR(100),
  execution_plan TEXT,
  ai_provider VARCHAR(100),
  output TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_results_task ON task_results(task_id);
CREATE INDEX IF NOT EXISTS idx_task_results_mission ON task_results(mission_id);
CREATE INDEX IF NOT EXISTS idx_task_results_agent ON task_results(agent_type);

-- 5. Create view for task hierarchy
CREATE OR REPLACE VIEW task_hierarchy AS
SELECT 
  t1.id,
  t1.mission_id,
  t1.title,
  t1.priority,
  t1.status,
  t1.assigned_to,
  t1.parent_task_id,
  t1.order_index,
  CASE 
    WHEN t1.parent_task_id IS NULL THEN 'root'
    ELSE 'child'
  END as level,
  COUNT(t2.id) as subtask_count,
  t1.created_at,
  t1.updated_at
FROM agent_tasks t1
LEFT JOIN agent_tasks t2 ON t2.parent_task_id = t1.id
GROUP BY t1.id, t1.mission_id, t1.title, t1.priority, t1.status, 
         t1.assigned_to, t1.parent_task_id, t1.order_index, t1.created_at, t1.updated_at;

-- 6. Add missing columns to agent_tasks if they don't exist
ALTER TABLE agent_tasks
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES agent_tasks(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]'::jsonb;

-- 7. Verify schema
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('missions', 'agent_tasks', 'task_logs', 'task_results')
ORDER BY table_name, ordinal_position;
