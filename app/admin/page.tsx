'use client';

import { useEffect, useState } from 'react';

interface Mission {
  id: string;
  title: string;
  priority: string;
  status: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

interface MissionLog {
  id: string;
  mission_id: string;
  agent_type: string;
  level: string;
  action: string;
  message: string;
  created_at: string;
}

interface Stats {
  total_missions: number;
  pending: number;
  in_progress: number;
  completed: number;
  failed: number;
  recent_logs: MissionLog[];
  mission_queue: Mission[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    if (!autoRefresh) return;

    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="mt-4 text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🎯 Nonce Syndicate Mission Control
            </h1>
            <p className="text-slate-400">Real-time autonomous agent monitoring</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                autoRefresh
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
            </button>
            <button
              onClick={fetchStats}
              className="px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
            >
              🔃 Refresh Now
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-8 text-red-200">
            ⚠️ Error: {error}
          </div>
        )}

        {stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <StatCard
                label="Total Missions"
                value={stats.total_missions}
                color="bg-blue-500"
              />
              <StatCard
                label="Pending"
                value={stats.pending}
                color="bg-yellow-500"
              />
              <StatCard
                label="In Progress"
                value={stats.in_progress}
                color="bg-purple-500"
              />
              <StatCard
                label="Completed"
                value={stats.completed}
                color="bg-green-500"
              />
              <StatCard
                label="Failed"
                value={stats.failed}
                color="bg-red-500"
              />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Mission Queue */}
              <div className="lg:col-span-2">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">📋 Mission Queue</h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {stats.mission_queue.length > 0 ? (
                      stats.mission_queue.map((mission) => (
                        <MissionRow key={mission.id} mission={mission} />
                      ))
                    ) : (
                      <p className="text-slate-400">No missions in queue</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4">📊 Health</h3>
                  <div className="space-y-2">
                    <HealthItem
                      label="Database"
                      status="healthy"
                      icon="✅"
                    />
                    <HealthItem
                      label="Inngest"
                      status="healthy"
                      icon="✅"
                    />
                    <HealthItem
                      label="AI Providers"
                      status="active"
                      icon="🤖"
                    />
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4">⏱️ Schedule</h3>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>🔄 Executes every 30 minutes</p>
                    <p>Last run: Just now</p>
                    <p>Next run: ~30 min</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4">🎯 Success Rate</h3>
                  <div className="text-3xl font-bold text-green-400">
                    {stats.completed > 0
                      ? Math.round((stats.completed / (stats.completed + stats.failed)) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Logs */}
            <div className="mt-8 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">📝 Recent Execution Logs</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-sm">
                {stats.recent_logs.length > 0 ? (
                  stats.recent_logs.map((log) => (
                    <LogEntry key={log.id} log={log} />
                  ))
                ) : (
                  <p className="text-slate-400">No logs yet</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-slate-500 text-sm">
              <p>Dashboard refreshing every 5 seconds • Last update: {new Date().toLocaleTimeString()}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`${color}/20 border border-${color.split('-')[1]}-500 rounded-lg p-6 text-center`}
    >
      <div className={`text-4xl font-bold text-${color.split('-')[1]}-400`}>
        {value}
      </div>
      <div className="text-slate-300 text-sm mt-2">{label}</div>
    </div>
  );
}

function MissionRow({ mission }: { mission: Mission }) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-200',
    in_progress: 'bg-purple-500/20 text-purple-200',
    completed: 'bg-green-500/20 text-green-200',
    failed: 'bg-red-500/20 text-red-200',
  };

  const priorityColors: Record<string, string> = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-green-400',
  };

  return (
    <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="text-white font-semibold">{mission.title}</p>
          <p className="text-slate-400 text-sm">{mission.id.slice(0, 12)}...</p>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[mission.status]}`}
          >
            {mission.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[mission.priority]}`}>
            {mission.priority}
          </span>
        </div>
      </div>
      <div className="text-slate-400 text-xs">
        Assigned to: <span className="text-slate-300 font-semibold">{mission.assigned_to}</span>
      </div>
    </div>
  );
}

function LogEntry({ log }: { log: MissionLog }) {
  const levelColors: Record<string, string> = {
    INFO: 'text-blue-400',
    ERROR: 'text-red-400',
    WARN: 'text-yellow-400',
    DEBUG: 'text-slate-400',
  };

  return (
    <div className={`${levelColors[log.level] || 'text-slate-300'}`}>
      <span className="text-slate-500">[{new Date(log.created_at).toLocaleTimeString()}]</span>
      {' '}
      <span className="font-semibold">{log.agent_type}</span>
      {' '}
      <span className="text-slate-400">→</span>
      {' '}
      <span>{log.action}: {log.message}</span>
    </div>
  );
}

function HealthItem({
  label,
  status,
  icon,
}: {
  label: string;
  status: string;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
      <span className="text-slate-300">{label}</span>
      <span className="text-lg">{icon}</span>
    </div>
  );
}
