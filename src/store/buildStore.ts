import { create } from 'zustand';
import type { BuildJob, Artifact } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import {
  supportsRemoteExecution,
  startRemoteJob,
  pollRemoteJob,
  cancelRemoteJob,
} from '@/lib/api/agentRunner';
import { useSettingsStore } from '@/store/settingsStore';

// ── Simulation constants ─────────────────────────────────────────────────────
/** Simulated artifact size range in bytes (5 MB – 55 MB). */
const MIN_ARTIFACT_SIZE = 5_000_000;
const MAX_ARTIFACT_SIZE = 50_000_000;

// ── Polling constants ────────────────────────────────────────────────────────
/** How often (ms) to poll the remote agent API for status updates. */
const DEFAULT_POLL_INTERVAL_MS = 10_000;
/** Multiplier applied to the interval after each consecutive poll failure. */
const POLL_BACKOFF_MULTIPLIER = 2;
/** Upper bound (ms) for the exponential back-off delay. */
const MAX_POLL_INTERVAL_MS = 60_000;

interface BuildStore {
  jobs: BuildJob[];
  artifacts: Artifact[];
  addJob: (job: Omit<BuildJob, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => BuildJob;
  updateJob: (id: string, updates: Partial<BuildJob>) => void;
  cancelJob: (id: string) => void;
  getJob: (id: string) => BuildJob | undefined;
  addArtifact: (artifact: Artifact) => void;
}

const MOCK_ARTIFACTS: Artifact[] = [
  {
    id: 'artifact-1',
    buildJobId: 'job-1',
    name: 'myapp-linux-amd64',
    size: 15728640,
    platform: 'linux_amd64',
    downloadUrl: '#',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    checksum: 'sha256:abc123def456',
    version: '1.0.0',
    metadata: { language: 'Go', agent: 'Google Jules' },
  },
  {
    id: 'artifact-2',
    buildJobId: 'job-2',
    name: 'webapp-linux-amd64',
    size: 52428800,
    platform: 'linux_amd64',
    downloadUrl: '#',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    checksum: 'sha256:xyz789',
    version: '2.1.3',
    metadata: { language: 'Node.js', agent: 'Codemagic' },
  },
];

const MOCK_JOBS: BuildJob[] = [
  {
    id: 'job-1',
    name: 'My Go App',
    repository: { type: 'github', url: 'https://github.com/user/myapp', branch: 'main' },
    agentId: 'google_jules',
    status: 'success',
    createdAt: new Date(Date.now() - 90000000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    startedAt: new Date(Date.now() - 88000000).toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    platform: 'linux_amd64',
    artifactId: 'artifact-1',
    logs: ['Cloning repository...', 'Detecting language: Go', 'Installing dependencies...', 'Building binary...', 'Build successful!'],
  },
  {
    id: 'job-2',
    name: 'Web App',
    repository: { type: 'gitlab', url: 'https://gitlab.com/user/webapp', branch: 'develop' },
    agentId: 'codemagic',
    status: 'success',
    createdAt: new Date(Date.now() - 180000000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    platform: 'linux_amd64',
    artifactId: 'artifact-2',
    logs: ['Cloning repository...', 'Detecting language: Node.js', 'npm install...', 'Building...', 'Success!'],
  },
  {
    id: 'job-3',
    name: 'Mobile App',
    repository: { type: 'github', url: 'https://github.com/user/mobileapp', branch: 'main' },
    agentId: 'github_copilot',
    status: 'running',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    startedAt: new Date(Date.now() - 3000000).toISOString(),
    platform: 'linux_amd64',
    logs: ['Cloning repository...', 'Detecting language: React Native', 'Installing dependencies...'],
  },
  {
    id: 'job-4',
    name: 'API Service',
    repository: { type: 'github', url: 'https://github.com/user/api', branch: 'main' },
    agentId: 'amp_remote',
    status: 'failed',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7000000).toISOString(),
    platform: 'linux_amd64',
    errorMessage: 'Dependency resolution failed: incompatible versions',
    logs: ['Cloning repository...', 'Detecting language: Python', 'Installing dependencies...', 'ERROR: Dependency resolution failed'],
  },
];


export const useBuildStore = create<BuildStore>()((set, get) => {
  // ── Simulation helpers ──────────────────────────────────────────────────
  function runSimulation(jobId: string) {
    setTimeout(() => {
      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === jobId
            ? { ...j, status: 'queued', updatedAt: new Date().toISOString() }
            : j,
        ),
      }));
    }, 2000);

    setTimeout(() => {
      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: 'running',
                startedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                logs: [
                  'Cloning repository...',
                  'Setting up build environment...',
                  'Detecting language and framework...',
                ],
              }
            : j,
        ),
      }));
    }, 4000);

    setTimeout(() => {
      const job = get().jobs.find((j) => j.id === jobId);
      if (!job || job.status === 'cancelled') return;

      const artifactId = uuidv4();
      const artifact: Artifact = {
        id: artifactId,
        buildJobId: jobId,
        name: `${job.name.toLowerCase().replace(/\s+/g, '-')}-${job.platform}`,
        size: Math.floor(Math.random() * MAX_ARTIFACT_SIZE) + MIN_ARTIFACT_SIZE,
        platform: job.platform,
        downloadUrl: '#',
        createdAt: new Date().toISOString(),
        checksum: `sha256:${Math.random().toString(36).substring(2, 15)}`,
        version: '1.0.0',
        metadata: { agent: job.agentId },
      };

      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: 'success',
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                artifactId,
                logs: [
                  ...(j.logs ?? []),
                  'Installing dependencies...',
                  'Building application...',
                  'Optimizing binary...',
                  'Build successful! Artifact ready for download.',
                ],
              }
            : j,
        ),
        artifacts: [artifact, ...state.artifacts],
      }));
    }, 12000);
  }

  // ── Remote-job runner ───────────────────────────────────────────────────
  async function runRemote(job: BuildJob) {
    const { settings } = useSettingsStore.getState();
    const config = settings.agents.find((a) => a.agentId === job.agentId);
    const proxy = settings.corsProxyUrl?.trim() || undefined;

    if (!config) return;

    try {
      // Mark as queued while we contact the remote API
      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === job.id
            ? { ...j, status: 'queued', updatedAt: new Date().toISOString() }
            : j,
        ),
      }));

      const { externalTaskId, initialLogs } = await startRemoteJob(job, config, proxy);

      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === job.id
            ? {
                ...j,
                status: 'running',
                externalTaskId,
                startedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                logs: initialLogs,
              }
            : j,
        ),
      }));

      // Start polling loop
      scheduleRemotePoll(job.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === job.id
            ? {
                ...j,
                status: 'failed',
                updatedAt: new Date().toISOString(),
                errorMessage: message,
                logs: [
                  ...(j.logs ?? []),
                  `ERROR: Failed to start remote job — ${message}`,
                ],
              }
            : j,
        ),
      }));
    }
  }

  function scheduleRemotePoll(jobId: string, intervalMs = DEFAULT_POLL_INTERVAL_MS) {
    setTimeout(async () => {
      const job = get().jobs.find((j) => j.id === jobId);
      if (!job || !job.externalTaskId) return;

      // Stop polling if the job reached a terminal state
      if (
        job.status === 'success' ||
        job.status === 'failed' ||
        job.status === 'cancelled'
      ) {
        return;
      }

      const { settings } = useSettingsStore.getState();
      const config = settings.agents.find((a) => a.agentId === job.agentId);
      const proxy = settings.corsProxyUrl?.trim() || undefined;
      if (!config) return;

      try {
        const result = await pollRemoteJob(job, config, proxy);

        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  status: result.status,
                  updatedAt: new Date().toISOString(),
                  ...(result.status === 'success' || result.status === 'failed'
                    ? { completedAt: new Date().toISOString() }
                    : {}),
                  logs: result.logs,
                  ...(result.errorMessage ? { errorMessage: result.errorMessage } : {}),
                }
              : j,
          ),
        }));

        // Keep polling while still running
        if (result.status === 'running' || result.status === 'queued') {
          scheduleRemotePoll(jobId, intervalMs);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // Log the poll error but keep retrying; don't fail the job immediately
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  updatedAt: new Date().toISOString(),
                  logs: [
                    ...(j.logs ?? []),
                    `WARN: Poll error — ${message}. Retrying...`,
                  ],
                }
              : j,
          ),
        }));
        // Retry with a longer back-off on errors
        scheduleRemotePoll(jobId, Math.min(intervalMs * POLL_BACKOFF_MULTIPLIER, MAX_POLL_INTERVAL_MS));
      }
    }, intervalMs);
  }

  return {
    jobs: MOCK_JOBS,
    artifacts: MOCK_ARTIFACTS,

    addJob: (jobData) => {
      const job: BuildJob = {
        ...jobData,
        id: uuidv4(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({ jobs: [job, ...state.jobs] }));

      const { settings } = useSettingsStore.getState();
      const config = settings.agents.find((a) => a.agentId === job.agentId);
      const useRealApi =
        config?.enabled === true &&
        config.apiKey.trim().length > 0 &&
        supportsRemoteExecution(job.agentId);

      if (useRealApi) {
        void runRemote(job);
      } else {
        runSimulation(job.id);
      }

      return job;
    },

    updateJob: (id, updates) =>
      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j,
        ),
      })),

    cancelJob: (id) => {
      const job = get().jobs.find((j) => j.id === id);
      if (
        !job ||
        !(
          job.status === 'pending' ||
          job.status === 'queued' ||
          job.status === 'running'
        )
      )
        return;

      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === id
            ? { ...j, status: 'cancelled', updatedAt: new Date().toISOString() }
            : j,
        ),
      }));

      // Fire-and-forget remote cancellation
      if (job.externalTaskId) {
        const { settings } = useSettingsStore.getState();
        const config = settings.agents.find((a) => a.agentId === job.agentId);
        if (config) {
          const proxy = settings.corsProxyUrl?.trim() || undefined;
          void cancelRemoteJob(job, config, proxy);
        }
      }
    },

    getJob: (id) => get().jobs.find((j) => j.id === id),
    addArtifact: (artifact) => set((state) => ({ artifacts: [artifact, ...state.artifacts] })),
  };
});
