export type BuildStatus = 'pending' | 'queued' | 'running' | 'success' | 'failed' | 'cancelled';

export type Platform = 'linux_amd64' | 'linux_arm64' | 'windows_amd64' | 'macos_amd64' | 'macos_arm64';

export type AgentId = 'google_jules' | 'cursor_agent' | 'codemagic' | 'github_copilot' | 'amp_remote';

export interface AIAgent {
  id: AgentId;
  name: string;
  description: string;
  supportedLanguages: string[];
  logoUrl?: string;
}

export interface Repository {
  type: 'github' | 'gitlab' | 'upload';
  url?: string;
  branch?: string;
  archiveName?: string;
}

export interface BuildJob {
  id: string;
  name: string;
  repository: Repository;
  agentId: AgentId;
  status: BuildStatus;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  platform: Platform;
  logs?: string[];
  artifactId?: string;
  errorMessage?: string;
}

export interface Artifact {
  id: string;
  buildJobId: string;
  name: string;
  size: number;
  platform: Platform;
  downloadUrl: string;
  createdAt: string;
  checksum: string;
  version?: string;
  metadata?: Record<string, string>;
}

export interface AgentConfig {
  agentId: AgentId;
  apiKey: string;
  apiUrl?: string;
  enabled: boolean;
}

export interface AppSettings {
  agents: AgentConfig[];
  defaultAgent?: AgentId;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}
