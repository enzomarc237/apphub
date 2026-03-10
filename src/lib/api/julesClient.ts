/**
 * Google Jules API client
 *
 * Base URL:  https://jules.googleapis.com/v1alpha
 * Auth:      X-Goog-Api-Key: {apiKey}  (request header)
 * Reference: https://developers.google.com/jules/api/reference/rest
 */

const JULES_BASE_URL = 'https://jules.googleapis.com/v1alpha';

// ─── Response shapes ────────────────────────────────────────────────────────

export type JulesSessionState =
  | 'SESSION_STATE_UNSPECIFIED'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED';

export interface JulesSession {
  /** Full resource name, e.g. "sessions/abc123" */
  name: string;
  title?: string;
  state: JulesSessionState;
  createTime?: string;
  updateTime?: string;
}

export interface JulesActivity {
  /** Full resource name, e.g. "sessions/abc123/activities/1" */
  name: string;
  message?: string;
  activityType?: string;
  createTime?: string;
}

export interface JulesActivitiesResponse {
  activities: JulesActivity[];
  nextPageToken?: string;
}

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Build the request URL, optionally routing through a CORS proxy.
 * The proxy receives the full original URL as its path segment so a simple
 * express/http-proxy-middleware setup works without special configuration.
 */
function resolveUrl(path: string, proxyUrl?: string): string {
  const target = `${JULES_BASE_URL}${path}`;
  if (!proxyUrl) return target;
  return `${proxyUrl.replace(/\/$/, '')}/${target}`;
}

function authHeaders(apiKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
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
    throw new Error(`Jules API error ${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

// ─── Public helpers ──────────────────────────────────────────────────────────

/**
 * Extract the Jules source identifier from a GitHub repository URL.
 * Returns e.g. "sources/github/myorg/myrepo" or null if the URL is not a
 * recognised GitHub URL.
 */
export function parseGithubSource(url: string): string | null {
  // Matches both https://github.com/owner/repo and git@github.com:owner/repo
  const match = url.match(/github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[/?#]|$)/);
  if (!match) return null;
  return `sources/github/${match[1]}/${match[2]}`;
}

/** Extract the bare session ID from a full resource name like "sessions/abc123". */
export function sessionIdFromName(name: string): string {
  return name.includes('/') ? name.split('/').pop()! : name;
}

// ─── API methods ─────────────────────────────────────────────────────────────

/**
 * Create (start) a new Jules session.
 *
 * Jules clones the repository, analyses the code, and autonomously resolves
 * the task described in `prompt`.  When `automationMode` is "AUTO_CREATE_PR"
 * Jules opens a pull request with its changes.
 */
export async function createJulesSession(
  apiKey: string,
  repoUrl: string,
  branch: string,
  prompt: string,
  title: string,
  proxyUrl?: string,
): Promise<JulesSession> {
  const source = parseGithubSource(repoUrl);
  if (!source) {
    throw new Error(
      `Jules only supports GitHub repositories. ` +
        `Cannot parse GitHub URL from: "${repoUrl}"`,
    );
  }

  const res = await fetch(resolveUrl('/sessions', proxyUrl), {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({
      title,
      prompt,
      sourceContext: {
        source,
        githubRepoContext: { startingBranch: branch || 'main' },
      },
      automationMode: 'AUTO_CREATE_PR',
    }),
  });

  return handleResponse<JulesSession>(res);
}

/**
 * Fetch the current state of a Jules session.
 * Accepts either a bare session ID or the full resource name.
 */
export async function getJulesSession(
  apiKey: string,
  sessionIdOrName: string,
  proxyUrl?: string,
): Promise<JulesSession> {
  const id = sessionIdFromName(sessionIdOrName);
  const res = await fetch(resolveUrl(`/sessions/${id}`, proxyUrl), {
    headers: authHeaders(apiKey),
  });
  return handleResponse<JulesSession>(res);
}

/**
 * List the activity log entries for a Jules session.
 * Each activity is one discrete step Jules took (plan generation, code change,
 * test execution, PR creation, etc.).
 */
export async function getJulesActivities(
  apiKey: string,
  sessionIdOrName: string,
  proxyUrl?: string,
): Promise<JulesActivity[]> {
  const id = sessionIdFromName(sessionIdOrName);
  const res = await fetch(resolveUrl(`/sessions/${id}/activities`, proxyUrl), {
    headers: authHeaders(apiKey),
  });
  const data = await handleResponse<JulesActivitiesResponse>(res);
  return data.activities ?? [];
}

// ─── Status mapping ──────────────────────────────────────────────────────────

/**
 * Map a Jules session state to the AppHub BuildStatus union.
 */
export function julesStateToStatus(
  state: JulesSessionState,
): 'pending' | 'running' | 'success' | 'failed' | 'cancelled' {
  switch (state) {
    case 'RUNNING':
      return 'running';
    case 'SUCCEEDED':
      return 'success';
    case 'FAILED':
      return 'failed';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'pending';
  }
}
