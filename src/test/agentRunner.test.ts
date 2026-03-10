/**
 * Tests for the agent runner dispatcher.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildPrompt, supportsRemoteExecution, startRemoteJob, pollRemoteJob, cancelRemoteJob } from '@/lib/api/agentRunner';
import type { BuildJob, AgentConfig } from '@/types';

const BASE_JOB: BuildJob = {
  id: 'j1',
  name: 'Test App',
  repository: { type: 'github', url: 'https://github.com/org/repo', branch: 'main' },
  agentId: 'google_jules',
  status: 'pending',
  platform: 'linux_amd64',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const JULES_CONFIG: AgentConfig = {
  agentId: 'google_jules',
  apiKey: 'jules-key-123',
  enabled: true,
};

const CURSOR_CONFIG: AgentConfig = {
  agentId: 'cursor_agent',
  apiKey: 'cursor-key-456',
  enabled: true,
};

// ─── buildPrompt ─────────────────────────────────────────────────────────────

describe('buildPrompt', () => {
  it('includes the job name', () => {
    expect(buildPrompt('My App', 'linux_amd64')).toContain('My App');
  });

  it('includes the platform', () => {
    expect(buildPrompt('app', 'macos_arm64')).toContain('macos_arm64');
  });
});

// ─── supportsRemoteExecution ──────────────────────────────────────────────────

describe('supportsRemoteExecution', () => {
  it('returns true for google_jules', () => {
    expect(supportsRemoteExecution('google_jules')).toBe(true);
  });

  it('returns true for cursor_agent', () => {
    expect(supportsRemoteExecution('cursor_agent')).toBe(true);
  });

  it('returns false for codemagic', () => {
    expect(supportsRemoteExecution('codemagic')).toBe(false);
  });

  it('returns false for unknown agents', () => {
    expect(supportsRemoteExecution('unknown_agent')).toBe(false);
  });
});

// ─── startRemoteJob (Jules) ───────────────────────────────────────────────────

describe('startRemoteJob with Jules', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns externalTaskId extracted from session name', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'sessions/sess-abc', state: 'RUNNING' }),
    });

    const result = await startRemoteJob(BASE_JOB, JULES_CONFIG);
    expect(result.externalTaskId).toBe('sess-abc');
    expect(result.initialLogs[0]).toContain('[Jules]');
  });
});

// ─── startRemoteJob (Cursor) ──────────────────────────────────────────────────

describe('startRemoteJob with Cursor', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns externalTaskId from agent id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'cursor-agent-xyz', status: 'running' }),
    });

    const job = { ...BASE_JOB, agentId: 'cursor_agent' as const };
    const result = await startRemoteJob(job, CURSOR_CONFIG);
    expect(result.externalTaskId).toBe('cursor-agent-xyz');
    expect(result.initialLogs[0]).toContain('[Cursor]');
  });
});

// ─── startRemoteJob (unsupported agent) ──────────────────────────────────────

describe('startRemoteJob with unsupported agent', () => {
  it('throws for unsupported agents', async () => {
    const job = { ...BASE_JOB, agentId: 'codemagic' as const };
    const config: AgentConfig = { agentId: 'codemagic', apiKey: 'key', enabled: true };
    await expect(startRemoteJob(job, config)).rejects.toThrow('not implemented');
  });
});

// ─── pollRemoteJob (Jules) ────────────────────────────────────────────────────

describe('pollRemoteJob with Jules', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('maps SUCCEEDED state to success status', async () => {
    // First fetch: getJulesSession
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'sessions/s1', state: 'SUCCEEDED' }),
    });
    // Second fetch: getJulesActivities
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        activities: [{ name: 'sessions/s1/activities/1', message: 'Build complete' }],
      }),
    });

    const job = { ...BASE_JOB, status: 'running' as const, externalTaskId: 's1' };
    const result = await pollRemoteJob(job, JULES_CONFIG);
    expect(result.status).toBe('success');
    expect(result.logs[0]).toContain('[Jules]');
  });

  it('includes error message for FAILED state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'sessions/s1', state: 'FAILED' }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activities: [] }),
    });

    const job = { ...BASE_JOB, status: 'running' as const, externalTaskId: 's1' };
    const result = await pollRemoteJob(job, JULES_CONFIG);
    expect(result.status).toBe('failed');
    expect(result.errorMessage).toBeTruthy();
  });

  it('throws when externalTaskId is missing', async () => {
    await expect(pollRemoteJob(BASE_JOB, JULES_CONFIG)).rejects.toThrow('externalTaskId');
  });
});

// ─── pollRemoteJob (Cursor) ───────────────────────────────────────────────────

describe('pollRemoteJob with Cursor', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('maps completed status to success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'a1',
        status: 'completed',
        prUrl: 'https://github.com/org/repo/pull/42',
        conversation: [
          { role: 'assistant', content: 'Build done.' },
        ],
      }),
    });

    const job = { ...BASE_JOB, agentId: 'cursor_agent' as const, status: 'running' as const, externalTaskId: 'a1' };
    const result = await pollRemoteJob(job, CURSOR_CONFIG);
    expect(result.status).toBe('success');
    expect(result.prUrl).toBe('https://github.com/org/repo/pull/42');
    expect(result.logs.some((l) => l.includes('Build done.'))).toBe(true);
    expect(result.logs.some((l) => l.includes('Pull Request'))).toBe(true);
  });
});

// ─── cancelRemoteJob ─────────────────────────────────────────────────────────

describe('cancelRemoteJob', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('calls DELETE for Cursor agents', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    const job = {
      ...BASE_JOB,
      agentId: 'cursor_agent' as const,
      externalTaskId: 'agent-99',
    };
    await cancelRemoteJob(job, CURSOR_CONFIG);
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('agent-99');
    expect(init.method).toBe('DELETE');
  });

  it('does nothing for Jules (no cancel endpoint)', async () => {
    const job = { ...BASE_JOB, externalTaskId: 's1' };
    await cancelRemoteJob(job, JULES_CONFIG);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does nothing when externalTaskId is absent', async () => {
    await cancelRemoteJob(BASE_JOB, JULES_CONFIG);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
