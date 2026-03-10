import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { AI_AGENTS } from '@/lib/agents';
import { Eye, EyeOff, Save, CheckCircle, ExternalLink, Info } from 'lucide-react';
import type { AgentId } from '@/types';

const AGENT_DOCS: Record<AgentId, string> = {
  google_jules: 'https://developers.google.com/jules/api',
  cursor_agent: 'https://cursor.com/docs/cloud-agent/api/endpoints',
  codemagic: 'https://codemagic.io/docs',
  github_copilot: 'https://github.com/features/copilot',
  amp_remote: 'https://ampere.cloud',
};

/** Extra guidance shown under the API key field for agents with real API support. */
const AGENT_HINTS: Partial<Record<AgentId, string>> = {
  google_jules:
    'Obtain an API key from the Google Cloud Console and enable the Jules API. ' +
    'Builds are submitted as Jules sessions via POST /v1alpha/sessions. ' +
    'Only GitHub repositories are supported.',
  cursor_agent:
    'Generate an API key from your Cursor dashboard (cursor.com/settings). ' +
    'Builds are submitted as Cursor background agents via POST /v0/agents. ' +
    'Authentication uses HTTP Basic with your key as the username.',
};

export default function SettingsPage() {
  const { settings, updateAgentConfig, updateSettings } = useSettingsStore();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savedAgents, setSavedAgents] = useState<Record<string, boolean>>({});
  const [localKeys, setLocalKeys] = useState<Record<string, string>>(() =>
    Object.fromEntries(settings.agents.map((a) => [a.agentId, a.apiKey]))
  );
  const [localProxy, setLocalProxy] = useState(settings.corsProxyUrl ?? '');

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

  const handleSaveProxy = () => {
    updateSettings({ corsProxyUrl: localProxy.trim() });
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
          Agents marked <span className="font-medium text-blue-600">Live API</span> submit real
          remote tasks when a key is provided; others run a local simulation.
        </p>
        <div className="space-y-5">
          {AI_AGENTS.map((agent) => {
            const config = settings.agents.find((a) => a.agentId === agent.id);
            const isEnabled = config?.enabled || false;
            const hint = AGENT_HINTS[agent.id];
            const isLive = agent.id === 'google_jules' || agent.id === 'cursor_agent';
            return (
              <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900 text-sm">{agent.name}</h3>
                      {isLive && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Live API
                        </span>
                      )}
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
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 flex-shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Docs
                  </a>
                </div>

                {hint && (
                  <div className="flex gap-2 mb-3 p-2 bg-blue-50 rounded-lg">
                    <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">{hint}</p>
                  </div>
                )}

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
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
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

      {/* CORS Proxy */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-1">CORS Proxy (optional)</h2>
        <p className="text-sm text-gray-500 mb-4">
          Browser security prevents direct calls to external APIs. If you see CORS errors when
          using Google Jules or Cursor Agent, enter the base URL of a CORS proxy you control.
          All agent API requests will be routed through{' '}
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
            {'{proxyUrl}/{originalApiUrl}'}
          </code>
          .
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={localProxy}
            onChange={(e) => setLocalProxy(e.target.value)}
            placeholder="http://localhost:8080  (leave blank to call APIs directly)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSaveProxy}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex-shrink-0"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
        {settings.corsProxyUrl && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Proxy configured: {settings.corsProxyUrl}
          </p>
        )}
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
