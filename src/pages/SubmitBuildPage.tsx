import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Github, GitBranch, Upload, CheckCircle2 } from 'lucide-react';
import { useBuildStore } from '@/store/buildStore';
import { useSettingsStore } from '@/store/settingsStore';
import { AI_AGENTS } from '@/lib/agents';
import type { AgentId, Platform } from '@/types';

const submitSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  repoType: z.enum(['github', 'gitlab', 'upload']),
  repoUrl: z.string().optional(),
  branch: z.string().optional(),
  agentId: z.string().min(1, 'Please select an AI agent'),
  platform: z.string().min(1, 'Please select a target platform'),
});

type SubmitForm = z.infer<typeof submitSchema>;

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'linux_amd64', label: 'Linux (x86_64)' },
  { value: 'linux_arm64', label: 'Linux (ARM64)' },
  { value: 'windows_amd64', label: 'Windows (x86_64)' },
  { value: 'macos_amd64', label: 'macOS (Intel)' },
  { value: 'macos_arm64', label: 'macOS (Apple Silicon)' },
];

export default function SubmitBuildPage() {
  const navigate = useNavigate();
  const addJob = useBuildStore((s) => s.addJob);
  const settings = useSettingsStore((s) => s.settings);
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const enabledAgentIds = settings.agents.filter((a) => a.enabled).map((a) => a.agentId);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SubmitForm>({
    resolver: zodResolver(submitSchema),
    defaultValues: { repoType: 'github', branch: 'main' },
  });

  const repoType = watch('repoType');

  const onSubmit = async (data: SubmitForm) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    const job = addJob({
      name: data.name,
      repository: {
        type: data.repoType,
        url: data.repoType !== 'upload' ? data.repoUrl : undefined,
        branch: data.branch || 'main',
        archiveName: data.repoType === 'upload' ? 'uploaded-archive.zip' : undefined,
      },
      agentId: data.agentId as AgentId,
      platform: data.platform as Platform,
    });
    setIsSubmitting(false);
    navigate(`/builds/${job.id}`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit New Build</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your build job and select an AI agent</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Name */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Project Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              {...register('name')}
              placeholder="e.g., My Awesome App"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
        </div>

        {/* Repository */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Code Repository</h2>
          <div className="flex gap-2 mb-4">
            {[
              { value: 'github', label: 'GitHub', icon: Github },
              { value: 'gitlab', label: 'GitLab', icon: GitBranch },
              { value: 'upload', label: 'Upload', icon: Upload },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('repoType', value as 'github' | 'gitlab' | 'upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  repoType === value
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {repoType !== 'upload' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repository URL</label>
                <input
                  {...register('repoUrl')}
                  placeholder={`https://${repoType}.com/username/repo`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <input
                  {...register('branch')}
                  placeholder="main"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Drag & drop your code archive here</p>
              <p className="text-xs text-gray-400 mt-1">Supports .zip, .tar.gz</p>
              <label className="mt-3 inline-block cursor-pointer">
                <span className="text-sm text-primary-600 hover:text-primary-700 font-medium">Browse files</span>
                <input type="file" accept=".zip,.tar.gz" className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* AI Agent Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Select AI Agent</h2>
          {enabledAgentIds.length === 0 && (
            <p className="text-amber-600 text-xs mb-3 flex items-center gap-1">
              ⚠️ No agents configured. Configure API keys in{' '}
              <a href="/settings" className="underline">Settings</a> to enable agents.
              All agents are available for selection below.
            </p>
          )}
          {errors.agentId && <p className="text-red-500 text-xs mb-3">{errors.agentId.message}</p>}
          <div className="grid gap-3">
            {AI_AGENTS.map((agent) => {
              const isConfigured = enabledAgentIds.includes(agent.id);
              const isSelected = selectedAgent === agent.id;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => {
                    setSelectedAgent(agent.id);
                    setValue('agentId', agent.id);
                  }}
                  className={`text-left p-4 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">{agent.name}</span>
                        {isConfigured && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="w-3 h-3" /> Configured
                          </span>
                        )}
                        {isSelected && (
                          <span className="ml-auto text-primary-600">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{agent.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Supports: {agent.supportedLanguages.join(', ')}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Platform */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Target Platform</h2>
          {errors.platform && <p className="text-red-500 text-xs mb-3">{errors.platform.message}</p>}
          <select
            {...register('platform')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">Select platform...</option>
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Submitting...
            </>
          ) : 'Submit Build Job'}
        </button>
      </form>
    </div>
  );
}
