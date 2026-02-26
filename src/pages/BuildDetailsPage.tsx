import { useParams, Link } from 'react-router-dom';
import { useBuildStore } from '@/store/buildStore';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, formatBytes, getPlatformLabel } from '@/lib/utils';
import { getAgentById } from '@/lib/agents';
import { ArrowLeft, Download, Terminal, Info, XCircle } from 'lucide-react';

export default function BuildDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const jobs = useBuildStore((s) => s.jobs);
  const artifacts = useBuildStore((s) => s.artifacts);
  const cancelJob = useBuildStore((s) => s.cancelJob);

  const job = jobs.find((j) => j.id === id);
  const artifact = job?.artifactId ? artifacts.find((a) => a.id === job.artifactId) : null;
  const agent = job ? getAgentById(job.agentId) : null;

  if (!job) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Build job not found.</p>
        <Link to="/dashboard" className="text-primary-600 text-sm mt-2 inline-block hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{job.name}</h1>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Build ID: {job.id}</p>
        </div>
        {(job.status === 'pending' || job.status === 'queued' || job.status === 'running') && (
          <button
            onClick={() => cancelJob(job.id)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>

      <div className="grid gap-5">
        {/* Build Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Build Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-0.5">Repository</p>
              <p className="font-medium text-gray-900 truncate">{job.repository.url || job.repository.archiveName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Branch</p>
              <p className="font-medium text-gray-900">{job.repository.branch || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">AI Agent</p>
              <p className="font-medium text-gray-900">{agent?.name || job.agentId}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Platform</p>
              <p className="font-medium text-gray-900">{getPlatformLabel(job.platform)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Created</p>
              <p className="font-medium text-gray-900">{formatDate(job.createdAt)}</p>
            </div>
            {job.completedAt && (
              <div>
                <p className="text-gray-500 mb-0.5">Completed</p>
                <p className="font-medium text-gray-900">{formatDate(job.completedAt)}</p>
              </div>
            )}
          </div>
          {job.errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <strong>Error:</strong> {job.errorMessage}
            </div>
          )}
        </div>

        {/* Artifact */}
        {artifact && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{artifact.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {formatBytes(artifact.size)} · {getPlatformLabel(artifact.platform)} · v{artifact.version}
                </p>
                <p className="text-xs text-gray-400 mt-1 font-mono">{artifact.checksum}</p>
              </div>
              <a
                href={artifact.downloadUrl}
                download={artifact.name}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
            {artifact.metadata && Object.keys(artifact.metadata).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Metadata</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(artifact.metadata).map(([k, v]) => (
                    <span key={k} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {k}: {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Build Logs */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Build Logs</h2>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 min-h-32 max-h-80 overflow-y-auto">
            {job.logs && job.logs.length > 0 ? (
              job.logs.map((log, i) => (
                <div key={i} className="flex gap-3 leading-relaxed">
                  <span className="text-gray-500 select-none">{String(i + 1).padStart(3, '0')}</span>
                  <span className={log.toLowerCase().includes('error') ? 'text-red-400' : log.toLowerCase().includes('success') ? 'text-green-400' : 'text-gray-300'}>
                    {log}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No logs available yet...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
