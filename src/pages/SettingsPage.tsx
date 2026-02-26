import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { AI_AGENTS } from '@/lib/agents';
import { Eye, EyeOff, Save, CheckCircle, ExternalLink } from 'lucide-react';
import type { AgentId } from '@/types';

const AGENT_DOCS: Record<AgentId, string> = {
  google_jules: 'https://jules.google.com',
  cursor_agent: 'https://cursor.sh',
  codemagic: 'https://codemagic.io/docs',
  github_copilot: 'https://github.com/features/copilot',
  amp_remote: 'https://ampere.cloud',
};

export default function SettingsPage() {
  const { settings, updateAgentConfig, updateSettings } = useSettingsStore();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savedAgents, setSavedAgents] = useState<Record<string, boolean>>({});
  const [localKeys, setLocalKeys] = useState<Record<string, string>>(() =>
    Object.fromEntries(settings.agents.map((a) => [a.agentId, a.apiKey]))
  );

  const toggleShowKey = (agentId: string) => {
    setShowKeys((prev) => ({ ...prev, [agentId]: !prev[agentId] }));
  };

  const handleSaveAgent = (agentId: AgentId) => {
    updateAgentConfig(agentId, {
      apiKey: localKeys[agentId] || '',
      enabled: (localKeys[agentId] || '').trim().length > 0,
    });
    setSavedAgents((prev) => ({ ...prev, [agentId]: true }));
    setTimeout(() => setSavedAgents((prev) => ({ ...prev, [agentId]: false })), 2000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure AI agent API keys and platform preferences</p>
      </div>

      {/* AI Agents */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-1">AI Agent Configuration</h2>
        <p className="text-sm text-gray-500 mb-5">
          Add your API keys for each AI build agent. Keys are stored locally in your browser.
        </p>
        <div className="space-y-5">
          {AI_AGENTS.map((agent) => {
            const config = settings.agents.find((a) => a.agentId === agent.id);
            const isEnabled = config?.enabled || false;
            return (
              <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 text-sm">{agent.name}</h3>
                      {isEnabled && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{agent.description}</p>
                  </div>
                  <a
                    href={AGENT_DOCS[agent.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Docs
                  </a>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys[agent.id] ? 'text' : 'password'}
                      value={localKeys[agent.id] || ''}
                      onChange={(e) => setLocalKeys((prev) => ({ ...prev, [agent.id]: e.target.value }))}
                      placeholder={`Enter ${agent.name} API key...`}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(agent.id)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showKeys[agent.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveAgent(agent.id as AgentId)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      savedAgents[agent.id]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {savedAgents[agent.id] ? (
                      <><CheckCircle className="w-4 h-4" /> Saved</>
                    ) : (
                      <><Save className="w-4 h-4" /> Save</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">General Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Build Notifications</p>
              <p className="text-xs text-gray-500">Receive notifications when builds complete</p>
            </div>
            <button
              onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                settings.notificationsEnabled ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Default AI Agent</p>
              <p className="text-xs text-gray-500">Pre-selected agent for new builds</p>
            </div>
            <select
              value={settings.defaultAgent || ''}
              onChange={(e) => updateSettings({ defaultAgent: (e.target.value as AgentId) || undefined })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">None</option>
              {AI_AGENTS.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
