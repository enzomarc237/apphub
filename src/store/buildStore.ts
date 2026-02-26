import { create } from 'zustand';
import type { BuildJob, Artifact } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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

export const useBuildStore = create<BuildStore>()((set, get) => ({
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
    setTimeout(() => {
      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === job.id ? { ...j, status: 'queued', updatedAt: new Date().toISOString() } : j
        ),
      }));
    }, 2000);
    setTimeout(() => {
      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === job.id ? { ...j, status: 'running', startedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), logs: ['Cloning repository...', 'Setting up build environment...', 'Detecting language and framework...'] } : j
        ),
      }));
    }, 4000);
    setTimeout(() => {
      const artifactId = uuidv4();
      const artifact: Artifact = {
        id: artifactId,
        buildJobId: job.id,
        name: `${jobData.name.toLowerCase().replace(/\s+/g, '-')}-${jobData.platform}`,
        size: Math.floor(Math.random() * 50000000) + 5000000,
        platform: jobData.platform,
        downloadUrl: '#',
        createdAt: new Date().toISOString(),
        checksum: `sha256:${Math.random().toString(36).substring(2, 15)}`,
        version: '1.0.0',
        metadata: { agent: jobData.agentId },
      };
      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === job.id
            ? { ...j, status: 'success', completedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), artifactId, logs: [...(j.logs || []), 'Installing dependencies...', 'Building application...', 'Optimizing binary...', 'Build successful! Artifact ready for download.'] }
            : j
        ),
        artifacts: [artifact, ...state.artifacts],
      }));
    }, 12000);
    return job;
  },
  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j)),
    })),
  cancelJob: (id) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === id && (j.status === 'pending' || j.status === 'queued' || j.status === 'running')
          ? { ...j, status: 'cancelled', updatedAt: new Date().toISOString() }
          : j
      ),
    })),
  getJob: (id) => get().jobs.find((j) => j.id === id),
  addArtifact: (artifact) => set((state) => ({ artifacts: [artifact, ...state.artifacts] })),
}));
