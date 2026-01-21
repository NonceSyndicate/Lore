'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface MissionStats {
  id: string;
  title: string;
  priority: string;
  status: string;
  assigned_to: string;
  log_entries: number;
  deliverables: number;
  github_commits: number;
  github_prs: number;
  outcome: string;
  execution_time: number;
  cost_usd: number;
  revenue_usd: number;
  created_at: string;
  completed_at: string;
}

interface AgentPerformance {
  agent: string;
  total_missions: number;
  completed: number;
  failed: number;
  success_rate: number;
  avg_execution_time_seconds: number;
  total_revenue_usd: number;
  total_commits: number;
  total_prs: number;
}

interface MissionLog {
  id: string;
  mission_id: string;
  level: string;
  message: string;
  agent_name?: string;
  action?: string;
  created_at: string;
}

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  
  const [missions, setMissions] = useState<MissionStats[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [recentLogs, setRecentLogs] = useState<MissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMissions: 0,
    completedMissions: 0,
    failedMissions: 0,
    totalRevenue: 0,
    totalCommits: 0,
    totalPRs: 0,
  });

  useEffect(() => {
    fetchData();
    
    // Subscribe to realtime updates
    const missionsChannel = supabase
      .channel('public:missions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'missions' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const logsChannel = supabase
      .channel('public:mission_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mission_logs' },
        () => {
          fetchRecentLogs();
        }
      )
      .subscribe();

    return () => {
      missionsChannel.unsubscribe();
      logsChannel.unsubscribe();
    };
  }, [supabase]);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch mission stats
      const { data: missionsData } = await supabase
        .from('mission_execution_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (missionsData) {
        setMissions(missionsData as MissionStats[]);
      }

      // Fetch agent performance
      const { data: agentData } = await supabase
        .from('agent_performance_summary')
        .select('*');

      if (agentData) {
        setAgentPerformance(agentData as AgentPerformance[]);
      }

      // Fetch recent logs
      await fetchRecentLogs();

      // Calculate summary stats
      if (missionsData) {
        const totalRevenue = missionsData.reduce((sum, m) => sum + (m.revenue_usd || 0), 0);
        const totalCommits = missionsData.reduce((sum, m) => sum + (m.github_commits || 0), 0);
        const totalPRs = missionsData.reduce((sum, m) => sum + (m.github_prs || 0), 0);
        const completed = missionsData.filter(m => m.status === 'completed').length;
        const failed = missionsData.filter(m => m.status === 'failed').length;

        setStats({
          totalMissions: missionsData.length,
          completedMissions: completed,
          failedMissions: failed,
          totalRevenue,
          totalCommits,
          totalPRs,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  }

  async function fetchRecentLogs() {
    try {
      const { data: logsData } = await supabase
        .from('mission_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsData) {
        setRecentLogs(logsData as MissionLog[]);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  if (loading && missions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Agent Dashboard</h1>
          <p className="text-gray-600">Real-time mission execution and agent performance metrics</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Total Missions</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalMissions}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Completed</div>
            <div className="text-3xl font-bold text-green-600">{stats.completedMissions}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Failed</div>
            <div className="text-3xl font-bold text-red-600">{stats.failedMissions}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-blue-600">${stats.totalRevenue.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Git Commits</div>
            <div className="text-3xl font-bold text-purple-600">{stats.totalCommits}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Pull Requests</div>
            <div className="text-3xl font-bold text-indigo-600">{stats.totalPRs}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Missions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Missions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Agent</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Revenue</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Commits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {missions.map((mission) => (
                      <tr key={mission.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 truncate">
                          <a href={`/missions/${mission.id}`} className="text-blue-600 hover:underline">
                            {mission.title}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
                            {mission.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{mission.assigned_to || 'signer'}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">${mission.revenue_usd?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{mission.github_commits || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Agent Performance */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Agent Performance</h2>
              <div className="space-y-4">
                {agentPerformance.map((agent) => (
                  <div key={agent.agent} className="border-l-4 border-blue-500 pl-4">
                    <div className="font-semibold text-gray-900 capitalize">{agent.agent}</div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                      <div>
                        <span className="text-gray-500">Missions:</span>{' '}
                        <span className="font-medium">{agent.total_missions}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Success:</span>{' '}
                        <span className="font-medium text-green-600">{agent.success_rate.toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Revenue:</span>{' '}
                        <span className="font-medium">${agent.total_revenue_usd.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Commits:</span>{' '}
                        <span className="font-medium">{agent.total_commits}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {agentPerformance.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No agent data available yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Level</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Agent</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentLogs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                        log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.agent_name || 'system'}</td>
                    <td className="px-4 py-3 text-gray-900 max-w-md truncate">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">No activity yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
