/**
 * Agent runner — routes a build job to the appropriate real API client
 * (Google Jules or Cursor) or notes that simulation should be used when
 * no API key is configured.
 *
 * The runner is intentionally side-effect free: it never mutates Zustand
 * store state directly.  The build store calls these helpers and applies the
 * returned updates itself, keeping async logic out of the store definition.
 */

import {
  createJulesSession,
  getJulesSession,
  getJulesActivities,
  julesStateToStatus,
  sessionIdFromName,
} from './julesClient';
import {
  createCursorAgent,
  getCursorAgent,
  deleteCursorAgent,
  cursorStatusToStatus,
} from './cursorClient';
import type { BuildJob, AgentConfig, BuildStatus } from '@/types';

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface RemoteStartResult {
  externalTaskId: string;
  initialLogs: string[];
}

export interface RemotePollResult {
  status: BuildStatus;
  logs: string[];
  errorMessage?: string;
  /** URL of the pull request created by the agent (if available) */
  prUrl?: string;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

/**
 * Generate a build prompt sent to the remote agent.
 * The prompt instructs the agent to build the application binary for the
 * requested platform.
 */
export function buildPrompt(jobName: string, platform: string): string {
  return (
    `Build the application "${jobName}" targeting platform ${platform}. ` +
    `Install all required dependencies, compile or bundle the project into a ` +
    `production-ready binary, run any available tests, and report the outcome. ` +
    `If there are errors, describe them clearly so they can be debugged.`
  );
}

// ─── Agent-specific runners ──────────────────────────────────────────────────

async function startJulesJob(
  job: BuildJob,
  config: AgentConfig,
  corsProxyUrl?: string,
): Promise<RemoteStartResult> {
  const repoUrl = job.repository.url ?? '';
  const branch = job.repository.branch ?? 'main';
  const session = await createJulesSession(
    config.apiKey,
    repoUrl,
    branch,
    buildPrompt(job.name, job.platform),
    job.name,
    corsProxyUrl,
  );

  const id = sessionIdFromName(session.name);
  return {
    externalTaskId: id,
    initialLogs: [
      `[Jules] Session created: ${id}`,
      `[Jules] Initial state: ${session.state}`,
    ],
  };
}

async function pollJulesJob(
  job: BuildJob,
  config: AgentConfig,
  corsProxyUrl?: string,
): Promise<RemotePollResult> {
  const taskId = job.externalTaskId!;
  const [session, activities] = await Promise.all([
    getJulesSession(config.apiKey, taskId, corsProxyUrl),
    getJulesActivities(config.apiKey, taskId, corsProxyUrl),
  ]);

  const status = julesStateToStatus(session.state);
  const logs =
    activities.length > 0
      ? activities.map((a) => `[Jules] ${a.message ?? a.activityType ?? 'Activity'}`)
      : [`[Jules] State: ${session.state}`];

  return {
    status,
    logs,
    errorMessage: status === 'failed' ? `Jules session failed (state: ${session.state})` : undefined,
  };
}

async function startCursorJob(
  job: BuildJob,
  config: AgentConfig,
  corsProxyUrl?: string,
): Promise<RemoteStartResult> {
  const repoUrl = job.repository.url ?? '';
  const branch = job.repository.branch ?? 'main';
  const agent = await createCursorAgent(
    config.apiKey,
    repoUrl,
    branch,
    buildPrompt(job.name, job.platform),
    corsProxyUrl,
  );

  return {
    externalTaskId: agent.id,
    initialLogs: [
      `[Cursor] Agent launched: ${agent.id}`,
      `[Cursor] Status: ${agent.status}`,
    ],
  };
}

async function pollCursorJob(
  job: BuildJob,
  config: AgentConfig,
  corsProxyUrl?: string,
): Promise<RemotePollResult> {
  const agent = await getCursorAgent(config.apiKey, job.externalTaskId!, corsProxyUrl);
  const status = cursorStatusToStatus(agent.status);

  const logs: string[] = [];
  if (agent.conversation) {
    for (const msg of agent.conversation) {
      if (msg.role === 'assistant') {
        logs.push(`[Cursor] ${msg.content}`);
      }
    }
  }
  if (logs.length === 0) {
    logs.push(`[Cursor] Status: ${agent.status}`);
  }
  if (agent.prUrl) {
    logs.push(`[Cursor] Pull Request: ${agent.prUrl}`);
  }

  return {
    status,
    logs,
    prUrl: agent.prUrl,
    errorMessage: status === 'failed' ? 'Cursor agent task failed' : undefined,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns true when `agentId` has a real remote API implementation.
 */
export function supportsRemoteExecution(agentId: string): boolean {
  return agentId === 'google_jules' || agentId === 'cursor_agent';
}

/**
 * Start a remote build job via the appropriate agent API.
 * Throws if the agent does not support remote execution or if the API call
 * itself fails (network error, auth failure, etc.).
 */
export async function startRemoteJob(
  job: BuildJob,
  config: AgentConfig,
  corsProxyUrl?: string,
): Promise<RemoteStartResult> {
  switch (job.agentId) {
    case 'google_jules':
      return startJulesJob(job, config, corsProxyUrl);
    case 'cursor_agent':
      return startCursorJob(job, config, corsProxyUrl);
    default:
      throw new Error(`Remote execution is not implemented for agent "${job.agentId}"`);
  }
}

/**
 * Poll a remote build job for status and log updates.
 * Throws if the polling API call fails.
 */
export async function pollRemoteJob(
  job: BuildJob,
  config: AgentConfig,
  corsProxyUrl?: string,
): Promise<RemotePollResult> {
  if (!job.externalTaskId) {
    throw new Error('Cannot poll: job has no externalTaskId');
  }
  switch (job.agentId) {
    case 'google_jules':
      return pollJulesJob(job, config, corsProxyUrl);
    case 'cursor_agent':
      return pollCursorJob(job, config, corsProxyUrl);
    default:
      throw new Error(`Remote polling is not implemented for agent "${job.agentId}"`);
  }
}

/**
 * Cancel a remote build job via the appropriate agent API.
 * Silently ignores agents that don't expose a cancel endpoint.
 */
export async function cancelRemoteJob(
  job: BuildJob,
  config: AgentConfig,
  corsProxyUrl?: string,
): Promise<void> {
  if (!job.externalTaskId) return;

  if (job.agentId === 'cursor_agent') {
    await deleteCursorAgent(config.apiKey, job.externalTaskId, corsProxyUrl);
  }
  // Jules does not document a dedicated cancel endpoint; nothing to do.
}
