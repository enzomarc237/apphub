/**
 * Cursor Cloud Agent API client
 *
 * Base URL:  https://api.cursor.com
 * Auth:      HTTP Basic — API key as the username, empty string as the password
 *            Authorization: Basic base64("<apiKey>:")
 * Reference: https://cursor.com/docs/cloud-agent/api/endpoints
 */

const CURSOR_BASE_URL = 'https://api.cursor.com';

// ─── Response shapes ─────────────────────────────────────────────────────────

export type CursorAgentStatus = 'running' | 'completed' | 'failed' | 'cancelled';

export interface CursorConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CursorAgent {
  id: string;
  status: CursorAgentStatus;
  createdAt?: string;
  updatedAt?: string;
  /** URL of the pull request created by the agent, if any */
  prUrl?: string;
  /** Full conversation history between the user prompt and the agent */
  conversation?: CursorConversationMessage[];
}

export interface CursorAgentListResponse {
  agents: CursorAgent[];
  /** Pagination cursor for the next page of results */
  cursor?: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Build the request URL, optionally routing through a CORS proxy.
 */
function resolveUrl(path: string, proxyUrl?: string): string {
  const target = `${CURSOR_BASE_URL}${path}`;
  if (!proxyUrl) return target;
  return `${proxyUrl.replace(/\/$/, '')}/${target}`;
}

/**
 * Build the Basic-auth Authorization header from a raw API key.
 * Cursor uses the API key as the HTTP Basic username with an empty password.
 */
function buildBasicAuth(apiKey: string): string {
  return `Basic ${btoa(`${apiKey}:`)}`;
}

function authHeaders(apiKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: buildBasicAuth(apiKey),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.text();
      detail = body || detail;
    } catch {
      // ignore
    }
    throw new Error(`Cursor API error ${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

// ─── API methods ─────────────────────────────────────────────────────────────

/**
 * Launch a new Cursor background (cloud) agent.
 *
 * The agent autonomously works on the specified GitHub repository branch,
 * guided by the plain-text `prompt`.  It can create pull requests, fix bugs,
 * implement features, and more without manual intervention.
 */
export async function createCursorAgent(
  apiKey: string,
  repoUrl: string,
  branch: string,
  prompt: string,
  proxyUrl?: string,
): Promise<CursorAgent> {
  const res = await fetch(resolveUrl('/v0/agents', proxyUrl), {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({
      prompt: { text: prompt },
      source: {
        repository: repoUrl,
        ref: branch || 'main',
      },
    }),
  });
  return handleResponse<CursorAgent>(res);
}

/**
 * Fetch the current state of a Cursor agent by its ID.
 */
export async function getCursorAgent(
  apiKey: string,
  agentId: string,
  proxyUrl?: string,
): Promise<CursorAgent> {
  const res = await fetch(resolveUrl(`/v0/agents/${agentId}`, proxyUrl), {
    headers: authHeaders(apiKey),
  });
  return handleResponse<CursorAgent>(res);
}

/**
 * List all Cursor agents for the authenticated user.
 *
 * @param limit   Max number of results (default 20, max 100).
 * @param cursor  Pagination cursor from a previous response.
 * @param prUrl   Optional filter: only return the agent for this PR URL.
 */
export async function listCursorAgents(
  apiKey: string,
  opts: { limit?: number; cursor?: string; prUrl?: string } = {},
  proxyUrl?: string,
): Promise<CursorAgentListResponse> {
  const params = new URLSearchParams();
  if (opts.limit !== undefined) params.set('limit', String(opts.limit));
  if (opts.cursor) params.set('cursor', opts.cursor);
  if (opts.prUrl) params.set('prUrl', opts.prUrl);

  const query = params.toString() ? `?${params}` : '';
  const res = await fetch(resolveUrl(`/v0/agents${query}`, proxyUrl), {
    headers: authHeaders(apiKey),
  });
  return handleResponse<CursorAgentListResponse>(res);
}

/**
 * Delete (cancel) a Cursor agent.
 * A 404 is silently ignored — the agent may already be gone.
 */
export async function deleteCursorAgent(
  apiKey: string,
  agentId: string,
  proxyUrl?: string,
): Promise<void> {
  const res = await fetch(resolveUrl(`/v0/agents/${agentId}`, proxyUrl), {
    method: 'DELETE',
    headers: authHeaders(apiKey),
  });
  if (!res.ok && res.status !== 404) {
    let detail = res.statusText;
    try {
      const body = await res.text();
      detail = body || detail;
    } catch {
      // ignore
    }
    throw new Error(`Cursor API error ${res.status}: ${detail}`);
  }
}

// ─── Status mapping ───────────────────────────────────────────────────────────

/**
 * Map a Cursor agent status string to the AppHub BuildStatus union.
 */
export function cursorStatusToStatus(
  status: CursorAgentStatus,
): 'running' | 'success' | 'failed' | 'cancelled' {
  switch (status) {
    case 'running':
      return 'running';
    case 'completed':
      return 'success';
    case 'failed':
      return 'failed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'running';
  }
}
