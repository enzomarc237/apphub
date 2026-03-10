/**
 * Tests for the Google Jules API client.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseGithubSource,
  sessionIdFromName,
  createJulesSession,
  getJulesSession,
  getJulesActivities,
  julesStateToStatus,
} from '@/lib/api/julesClient';

// ─── parseGithubSource ────────────────────────────────────────────────────────

describe('parseGithubSource', () => {
  it('parses standard HTTPS GitHub URLs', () => {
    expect(parseGithubSource('https://github.com/myorg/myrepo')).toBe(
      'sources/github/myorg/myrepo',
    );
  });

  it('parses HTTPS URLs with .git suffix', () => {
    expect(parseGithubSource('https://github.com/myorg/myrepo.git')).toBe(
      'sources/github/myorg/myrepo',
    );
  });

  it('parses HTTPS URLs with trailing slash', () => {
    expect(parseGithubSource('https://github.com/myorg/myrepo/')).toBe(
      'sources/github/myorg/myrepo',
    );
  });

  it('returns null for non-GitHub URLs', () => {
    expect(parseGithubSource('https://gitlab.com/myorg/myrepo')).toBeNull();
  });

  it('returns null for empty strings', () => {
    expect(parseGithubSource('')).toBeNull();
  });
});

// ─── sessionIdFromName ────────────────────────────────────────────────────────

describe('sessionIdFromName', () => {
  it('extracts the ID from a full resource name', () => {
    expect(sessionIdFromName('sessions/abc123')).toBe('abc123');
  });

  it('returns the input unchanged when there is no slash', () => {
    expect(sessionIdFromName('abc123')).toBe('abc123');
  });
});

// ─── julesStateToStatus ───────────────────────────────────────────────────────

describe('julesStateToStatus', () => {
  it('maps RUNNING → running', () => {
    expect(julesStateToStatus('RUNNING')).toBe('running');
  });

  it('maps SUCCEEDED → success', () => {
    expect(julesStateToStatus('SUCCEEDED')).toBe('success');
  });

  it('maps FAILED → failed', () => {
    expect(julesStateToStatus('FAILED')).toBe('failed');
  });

  it('maps CANCELLED → cancelled', () => {
    expect(julesStateToStatus('CANCELLED')).toBe('cancelled');
  });

  it('maps SESSION_STATE_UNSPECIFIED → pending', () => {
    expect(julesStateToStatus('SESSION_STATE_UNSPECIFIED')).toBe('pending');
  });
});

// ─── API methods (with fetch mocks) ──────────────────────────────────────────

describe('createJulesSession', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('POSTs to the correct URL with auth header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'sessions/s1', state: 'RUNNING' }),
    });

    const session = await createJulesSession(
      'my-api-key',
      'https://github.com/org/repo',
      'main',
      'Build the app',
      'My App',
    );

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://jules.googleapis.com/v1alpha/sessions');
    expect((init.headers as Record<string, string>)['X-Goog-Api-Key']).toBe('my-api-key');
    expect(init.method).toBe('POST');

    const body = JSON.parse(init.body as string);
    expect(body.sourceContext.source).toBe('sources/github/org/repo');
    expect(body.sourceContext.githubRepoContext.startingBranch).toBe('main');
    expect(session.name).toBe('sessions/s1');
  });

  it('routes through a proxy URL when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'sessions/s2', state: 'RUNNING' }),
    });

    await createJulesSession(
      'key',
      'https://github.com/org/repo',
      'main',
      'prompt',
      'title',
      'http://localhost:8080',
    );

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toMatch(/^http:\/\/localhost:8080\//);
    expect(url).toContain('jules.googleapis.com');
  });

  it('throws on non-OK responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'Invalid API key',
    });

    await expect(
      createJulesSession('bad-key', 'https://github.com/org/repo', 'main', 'prompt', 'title'),
    ).rejects.toThrow('Jules API error 401');
  });

  it('throws for non-GitHub URLs', async () => {
    await expect(
      createJulesSession('key', 'https://gitlab.com/org/repo', 'main', 'prompt', 'title'),
    ).rejects.toThrow('Jules only supports GitHub');
  });
});

describe('getJulesSession', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('GETs the correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'sessions/abc', state: 'SUCCEEDED' }),
    });

    const session = await getJulesSession('key', 'abc');
    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain('/sessions/abc');
    expect(session.state).toBe('SUCCEEDED');
  });

  it('accepts a full resource name', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'sessions/xyz', state: 'RUNNING' }),
    });

    await getJulesSession('key', 'sessions/xyz');
    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain('/sessions/xyz');
  });
});

describe('getJulesActivities', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns an empty array when no activities field is present', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const activities = await getJulesActivities('key', 'abc');
    expect(activities).toEqual([]);
  });

  it('returns activity objects from the response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        activities: [
          { name: 'sessions/abc/activities/1', message: 'Plan generated' },
          { name: 'sessions/abc/activities/2', message: 'Code changed' },
        ],
      }),
    });

    const activities = await getJulesActivities('key', 'abc');
    expect(activities).toHaveLength(2);
    expect(activities[0].message).toBe('Plan generated');
  });
});
