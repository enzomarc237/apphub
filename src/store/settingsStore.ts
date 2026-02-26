import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, AgentConfig, AgentId } from '@/types';

const defaultSettings: AppSettings = {
  agents: [
    { agentId: 'google_jules', apiKey: '', enabled: false },
    { agentId: 'cursor_agent', apiKey: '', enabled: false },
    { agentId: 'codemagic', apiKey: '', enabled: false },
    { agentId: 'github_copilot', apiKey: '', enabled: false },
    { agentId: 'amp_remote', apiKey: '', enabled: false },
  ],
  notificationsEnabled: true,
  theme: 'light',
};

interface SettingsStore {
  settings: AppSettings;
  updateAgentConfig: (agentId: AgentId, config: Partial<AgentConfig>) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  getAgentConfig: (agentId: AgentId) => AgentConfig | undefined;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      updateAgentConfig: (agentId, config) =>
        set((state) => ({
          settings: {
            ...state.settings,
            agents: state.settings.agents.map((a) =>
              a.agentId === agentId ? { ...a, ...config } : a
            ),
          },
        })),
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
      getAgentConfig: (agentId) =>
        get().settings.agents.find((a) => a.agentId === agentId),
    }),
    { name: 'apphub-settings' }
  )
);
