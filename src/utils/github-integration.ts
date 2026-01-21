/**
 * GitHub Integration Utility
 * Handles repository operations: branch creation, file operations, PR creation, commits
 */

import { supabase } from '../inngest/client';

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export interface BranchCreateResult {
  success: boolean;
  branchName: string;
  sha: string;
  url?: string;
  error?: string;
}

export interface FileCreateResult {
  success: boolean;
  fileName: string;
  sha: string;
  url?: string;
  path?: string;
  error?: string;
}

export interface CommitResult {
  success: boolean;
  commitHash: string;
  message: string;
  url?: string;
  error?: string;
}

export interface PRCreateResult {
  success: boolean;
  prNumber: number;
  url: string;
  htmlUrl: string;
  error?: string;
}

/**
 * Get GitHub API headers with authentication
 */
function getHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

/**
 * Get default branch SHA
 */
export async function getDefaultBranchSha(config: GitHubConfig): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/git/refs/heads/${config.branch}`,
      { headers: getHeaders(config.token) }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.object.sha;
  } catch (error) {
    console.error('Failed to get default branch SHA:', error);
    return null;
  }
}

/**
 * Create a new branch from default branch
 */
export async function createBranch(
  config: GitHubConfig,
  newBranchName: string
): Promise<BranchCreateResult> {
  try {
    // Get current default branch SHA
    const baseSha = await getDefaultBranchSha(config);
    if (!baseSha) {
      return {
        success: false,
        branchName: newBranchName,
        sha: '',
        error: 'Could not get base branch SHA'
      };
    }

    // Create new branch reference
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/git/refs`,
      {
        method: 'POST',
        headers: getHeaders(config.token),
        body: JSON.stringify({
          ref: `refs/heads/${newBranchName}`,
          sha: baseSha,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        branchName: newBranchName,
        sha: '',
        error: error.message || `GitHub API error: ${response.status}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      branchName: newBranchName,
      sha: data.object.sha,
      url: `https://github.com/${config.owner}/${config.repo}/tree/${newBranchName}`
    };
  } catch (error) {
    return {
      success: false,
      branchName: newBranchName,
      sha: '',
      error: `Exception: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Create or update a file in the repository
 */
export async function createOrUpdateFile(
  config: GitHubConfig,
  filePath: string,
  content: string,
  commitMessage: string,
  branch: string = config.branch
): Promise<FileCreateResult> {
  try {
    // Get current file if it exists
    let sha = undefined;
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${branch}`,
        { headers: getHeaders(config.token) }
      );

      if (getResponse.ok) {
        const data = await getResponse.json();
        sha = data.sha;
      }
    } catch (e) {
      // File doesn't exist, that's okay
    }

    // Create or update file
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: getHeaders(config.token),
        body: JSON.stringify({
          message: commitMessage,
          content: Buffer.from(content).toString('base64'),
          branch: branch,
          sha: sha,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        fileName: filePath.split('/').pop() || filePath,
        sha: '',
        path: filePath,
        error: error.message || `GitHub API error: ${response.status}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      fileName: filePath.split('/').pop() || filePath,
      sha: data.content.sha,
      path: filePath,
      url: data.content.html_url
    };
  } catch (error) {
    return {
      success: false,
      fileName: filePath.split('/').pop() || filePath,
      sha: '',
      path: filePath,
      error: `Exception: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Create a pull request
 */
export async function createPullRequest(
  config: GitHubConfig,
  title: string,
  description: string,
  sourceBranch: string,
  targetBranch: string = 'main'
): Promise<PRCreateResult> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/pulls`,
      {
        method: 'POST',
        headers: getHeaders(config.token),
        body: JSON.stringify({
          title,
          body: description,
          head: sourceBranch,
          base: targetBranch,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        prNumber: 0,
        url: '',
        htmlUrl: '',
        error: error.message || `GitHub API error: ${response.status}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      prNumber: data.number,
      url: data.url,
      htmlUrl: data.html_url
    };
  } catch (error) {
    return {
      success: false,
      prNumber: 0,
      url: '',
      htmlUrl: '',
      error: `Exception: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Log GitHub action to database
 */
export async function logGitHubAction(
  missionId: string,
  actionType: 'branch_created' | 'file_created' | 'pr_created' | 'commit_made',
  data: Record<string, any>
): Promise<boolean> {
  try {
    if (!supabase) return false;

    const { error } = await supabase
      .from('mission_audit_trail')
      .insert({
        mission_id: missionId,
        event_type: actionType.replace('_', '_').toUpperCase(),
        description: `GitHub ${actionType.replace(/_/g, ' ')}`,
        metadata: data,
        agent_name: 'github-integration'
      });

    if (error) {
      console.error('Failed to log GitHub action:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception logging GitHub action:', error);
    return false;
  }
}

/**
 * Record a commit in the database
 */
export async function recordCommit(
  missionId: string,
  commitHash: string,
  branchName: string,
  message: string,
  filesChanged?: number,
  insertions?: number,
  deletions?: number
): Promise<boolean> {
  try {
    if (!supabase) return false;

    const { error } = await supabase
      .from('github_commits')
      .insert({
        mission_id: missionId,
        commit_hash: commitHash,
        branch_name: branchName,
        commit_message: message,
        author_name: 'Agent System',
        author_email: 'agents@nonce-syndicate.com',
        files_changed: filesChanged,
        insertions,
        deletions,
        committed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to record commit:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception recording commit:', error);
    return false;
  }
}

/**
 * Record a PR in the database
 */
export async function recordPR(
  missionId: string,
  prNumber: number,
  prUrl: string,
  title: string,
  description: string,
  sourceBranch: string,
  targetBranch: string
): Promise<boolean> {
  try {
    if (!supabase) return false;

    const { error } = await supabase
      .from('github_prs')
      .insert({
        mission_id: missionId,
        pr_number: prNumber,
        pr_url: prUrl,
        title,
        description,
        source_branch: sourceBranch,
        target_branch: targetBranch,
        status: 'open'
      });

    if (error) {
      console.error('Failed to record PR:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception recording PR:', error);
    return false;
  }
}

/**
 * Record a deliverable
 */
export async function recordDeliverable(
  missionId: string,
  name: string,
  description: string,
  type: 'code' | 'document' | 'analysis' | 'report' | 'other',
  content?: string,
  filePath?: string,
  githubUrl?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase not initialized' };

    const { data, error } = await supabase
      .from('mission_deliverables')
      .insert({
        mission_id: missionId,
        name,
        description,
        type,
        content: content || null,
        file_path: filePath,
        github_url: githubUrl,
        status: 'completed'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to record deliverable:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    return {
      success: false,
      error: `Exception: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Get GitHub configuration from environment
 */
export function getGitHubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    console.warn('GitHub configuration incomplete. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');
    return null;
  }

  return { token, owner, repo, branch };
}

/**
 * Example: Generate a code file and commit it
 */
export async function generateAndCommitCode(
  missionId: string,
  fileName: string,
  code: string,
  description: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  const config = getGitHubConfig();
  if (!config) {
    return { success: false, error: 'GitHub not configured' };
  }

  try {
    // Create a feature branch
    const branchName = `feature/mission-${missionId.substring(0, 8)}-${Date.now()}`;
    const branchResult = await createBranch(config, branchName);

    if (!branchResult.success) {
      return { success: false, error: branchResult.error };
    }

    // Create the file
    const filePath = `generated/${fileName}`;
    const fileResult = await createOrUpdateFile(
      config,
      filePath,
      code,
      description,
      branchName
    );

    if (!fileResult.success) {
      return { success: false, error: fileResult.error };
    }

    // Create a PR
    const prResult = await createPullRequest(
      config,
      `[Mission ${missionId.substring(0, 8)}] ${description}`,
      `Generated as part of mission execution.\n\nFile: ${filePath}`,
      branchName,
      config.branch
    );

    if (!prResult.success) {
      return { success: false, error: prResult.error };
    }

    // Record in database
    await recordDeliverable(
      missionId,
      fileName,
      description,
      'code',
      code,
      filePath,
      prResult.htmlUrl
    );

    await recordPR(
      missionId,
      prResult.prNumber,
      prResult.url,
      prResult.htmlUrl.split('/').pop() || 'PR',
      description,
      branchName,
      config.branch
    );

    return { success: true, path: filePath };
  } catch (error) {
    return {
      success: false,
      error: `Exception: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
