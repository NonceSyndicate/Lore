'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface MissionReport {
  mission: any;
  deliverables: any[];
  github: {
    commits: any[];
    prs: any[];
    totalCommits: number;
    totalPRs: number;
    totalAdditions: number;
    totalDeletions: number;
  };
  auditTrail: any[];
  revenue: number;
  generatedAt: string;
}

export default function MissionReportPage({ params }: { params: { id: string } }) {
  const supabaseRef = useRef<SupabaseClient | null>(null);
  
  // Initialize Supabase client once
  if (!supabaseRef.current) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      supabaseRef.current = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  
  const supabase = supabaseRef.current;
  
  const [report, setReport] = useState<MissionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, [params.id]); // Keep params.id since it's a prop

  async function fetchReport() {
    if (!supabase) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch mission stats
      const { data: missionData } = await supabase
        .from('mission_execution_summary')
        .select('*')
        .eq('id', params.id)
        .single();

      // Fetch deliverables
      const { data: deliverables } = await supabase
        .from('mission_deliverables')
        .select('*')
        .eq('mission_id', params.id)
        .order('created_at', { ascending: false });

      // Fetch GitHub commits
      const { data: commits } = await supabase
        .from('github_commits')
        .select('*')
        .eq('mission_id', params.id)
        .order('created_at', { ascending: false });

      // Fetch GitHub PRs
      const { data: prs } = await supabase
        .from('github_prs')
        .select('*')
        .eq('mission_id', params.id)
        .order('created_at', { ascending: false });

      // Fetch audit trail
      const { data: auditTrail } = await supabase
        .from('mission_audit_trail')
        .select('*')
        .eq('mission_id', params.id)
        .order('created_at', { ascending: true });

      // Fetch revenue
      const { data: metrics } = await supabase
        .from('mission_metrics')
        .select('amount_usd')
        .eq('mission_id', params.id);

      const totalRevenue = (metrics || []).reduce((sum, m) => sum + (m.amount_usd || 0), 0);
      const totalAdditions = (commits || []).reduce((sum, c) => sum + (c.insertions || 0), 0);
      const totalDeletions = (commits || []).reduce((sum, c) => sum + (c.deletions || 0), 0);

      setReport({
        mission: missionData,
        deliverables: deliverables || [],
        github: {
          commits: commits || [],
          prs: prs || [],
          totalCommits: (commits || []).length,
          totalPRs: (prs || []).length,
          totalAdditions,
          totalDeletions,
        },
        auditTrail: auditTrail || [],
        revenue: totalRevenue,
        generatedAt: new Date().toISOString(),
      });

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch report:', err);
      setError('Failed to load mission report');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mission report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
          <p className="text-red-600 font-semibold">{error || 'Mission not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </a>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{report.mission?.title}</h1>
          <p className="text-gray-600">Mission Report and Audit Trail</p>
        </div>

        {/* Mission Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Status</div>
            <div className="text-2xl font-bold text-gray-900">{report.mission?.status}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Agent</div>
            <div className="text-2xl font-bold text-gray-900 capitalize">
              {report.mission?.assigned_to || 'signer'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Execution Time</div>
            <div className="text-2xl font-bold text-gray-900">
              {report.mission?.execution_time ? `${(report.mission.execution_time / 60).toFixed(2)}m` : 'N/A'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">${report.revenue.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Deliverables */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Deliverables ({report.deliverables.length})</h2>
              {report.deliverables.length > 0 ? (
                <div className="space-y-4">
                  {report.deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{deliverable.name}</h3>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          {deliverable.type}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{deliverable.description}</p>
                      {deliverable.github_url && (
                        <a
                          href={deliverable.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View on GitHub →
                        </a>
                      )}
                      {deliverable.file_path && (
                        <div className="text-gray-600 text-sm mt-2">
                          <span className="font-medium">Path:</span> {deliverable.file_path}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No deliverables recorded</p>
              )}
            </div>

            {/* GitHub Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">GitHub Activity</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded p-4">
                  <div className="text-blue-600 font-semibold">{report.github.totalCommits} Commits</div>
                  <div className="text-sm text-blue-600">
                    <span>+{report.github.totalAdditions} </span>
                    <span>-{report.github.totalDeletions}</span>
                  </div>
                </div>
                <div className="bg-purple-50 rounded p-4">
                  <div className="text-purple-600 font-semibold">{report.github.totalPRs} Pull Requests</div>
                  <div className="text-sm text-purple-600">Code review ready</div>
                </div>
              </div>

              {report.github.commits.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Commits</h3>
                  <div className="space-y-2">
                    {report.github.commits.slice(0, 5).map((commit) => (
                      <div key={commit.id} className="text-sm border-l-2 border-gray-300 pl-3 py-2">
                        <div className="font-mono text-xs text-gray-600">{commit.commit_hash.substring(0, 7)}</div>
                        <div className="text-gray-900">{commit.commit_message}</div>
                        <div className="text-gray-600 text-xs mt-1">
                          {commit.branch_name} · +{commit.insertions || 0} -{commit.deletions || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.github.prs.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Pull Requests</h3>
                  <div className="space-y-2">
                    {report.github.prs.slice(0, 5).map((pr) => (
                      <div key={pr.id} className="text-sm border rounded p-3 hover:bg-gray-50">
                        <a
                          href={pr.pr_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          #{pr.pr_number} {pr.title}
                        </a>
                        <div className="text-gray-600 text-xs mt-1">
                          {pr.source_branch} → {pr.target_branch}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Metrics Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Metrics Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deliverables:</span>
                  <span className="font-semibold">{report.deliverables.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commits:</span>
                  <span className="font-semibold">{report.github.totalCommits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PRs:</span>
                  <span className="font-semibold">{report.github.totalPRs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Log Entries:</span>
                  <span className="font-semibold">{report.mission?.log_entries || 0}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-600 font-medium">Total Revenue:</span>
                  <span className="font-bold text-green-600">${report.revenue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <div className="text-gray-900">
                    {new Date(report.mission?.created_at).toLocaleString()}
                  </div>
                </div>
                {report.mission?.started_at && (
                  <div>
                    <span className="text-gray-600">Started:</span>
                    <div className="text-gray-900">
                      {new Date(report.mission.started_at).toLocaleString()}
                    </div>
                  </div>
                )}
                {report.mission?.completed_at && (
                  <div>
                    <span className="text-gray-600">Completed:</span>
                    <div className="text-gray-900">
                      {new Date(report.mission.completed_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Audit Trail ({report.auditTrail.length})</h2>
          <div className="space-y-4">
            {report.auditTrail.map((event, index) => (
              <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900">{event.event_type}</h3>
                  <span className="text-xs text-gray-500">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{event.description}</p>
                {event.agent_name && (
                  <div className="text-xs text-gray-600 mt-1">
                    Agent: {event.agent_name}
                  </div>
                )}
              </div>
            ))}
            {report.auditTrail.length === 0 && (
              <p className="text-gray-500 text-center py-4">No audit trail events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
