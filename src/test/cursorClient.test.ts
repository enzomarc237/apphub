/**
 * Tests for the Cursor Cloud Agent API client.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createCursorAgent,
  getCursorAgent,
  deleteCursorAgent,
  cursorStatusToStatus,
} from '@/lib/api/cursorClient';

// ─── cursorStatusToStatus ─────────────────────────────────────────────────────

describe('cursorStatusToStatus', () => {
  it('maps running → running', () => {
    expect(cursorStatusToStatus('running')).toBe('running');
  });

  it('maps completed → success', () => {
    expect(cursorStatusToStatus('completed')).toBe('success');
  });

  it('maps failed → failed', () => {
    expect(cursorStatusToStatus('failed')).toBe('failed');
  });

  it('maps cancelled → cancelled', () => {
    expect(cursorStatusToStatus('cancelled')).toBe('cancelled');
  });
});

// ─── createCursorAgent ────────────────────────────────────────────────────────

describe('createCursorAgent', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('POSTs to the correct URL with Basic auth header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'agent-1', status: 'running' }),
    });

    const agent = await createCursorAgent(
      'my-api-key',
      'https://github.com/org/repo',
      'main',
      'Build the app',
    );

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.cursor.com/v0/agents');
    expect(init.method).toBe('POST');

    // Authorization header must be Basic with base64(apiKey + ":")
    const expectedAuth = `Basic ${btoa('my-api-key:')}`;
    expect((init.headers as Record<string, string>).Authorization).toBe(expectedAuth);

    const body = JSON.parse(init.body as string);
    expect(body.prompt.text).toBe('Build the app');
    expect(body.source.repository).toBe('https://github.com/org/repo');
    expect(body.source.ref).toBe('main');

    expect(agent.id).toBe('agent-1');
    expect(agent.status).toBe('running');
  });

  it('routes through a proxy URL when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'a2', status: 'running' }),
    });

    await createCursorAgent('key', 'https://github.com/org/repo', 'main', 'prompt', 'http://proxy:9000');

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toMatch(/^http:\/\/proxy:9000\//);
    expect(url).toContain('api.cursor.com');
  });

  it('throws on non-OK responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: async () => 'Invalid credentials',
    });

    await expect(
      createCursorAgent('bad-key', 'https://github.com/org/repo', 'main', 'prompt'),
    ).rejects.toThrow('Cursor API error 403');
  });
});

// ─── getCursorAgent ───────────────────────────────────────────────────────────

describe('getCursorAgent', () => {
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
      json: async () => ({ id: 'agent-42', status: 'completed' }),
    });

    const agent = await getCursorAgent('key', 'agent-42');
    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain('/v0/agents/agent-42');
    expect(agent.status).toBe('completed');
  });
});

// ─── deleteCursorAgent ────────────────────────────────────────────────────────

describe('deleteCursorAgent', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('sends DELETE to the correct URL', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    await deleteCursorAgent('key', 'agent-99');
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/v0/agents/agent-99');
    expect(init.method).toBe('DELETE');
  });

  it('ignores 404 responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => '',
    });

    await expect(deleteCursorAgent('key', 'already-gone')).resolves.toBeUndefined();
  });

  it('throws for non-404 error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Server exploded',
    });

    await expect(deleteCursorAgent('key', 'agent-x')).rejects.toThrow('Cursor API error 500');
  });
});
