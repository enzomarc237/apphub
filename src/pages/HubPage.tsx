import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBuildStore } from '@/store/buildStore';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, formatBytes, getPlatformLabel } from '@/lib/utils';
import { getAgentById } from '@/lib/agents';
import { Search, Download, ExternalLink, Package } from 'lucide-react';
import type { BuildStatus } from '@/types';

export default function HubPage() {
  const jobs = useBuildStore((s) => s.jobs);
  const artifacts = useBuildStore((s) => s.artifacts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BuildStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'builds' | 'artifacts'>('builds');

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch = j.name.toLowerCase().includes(search.toLowerCase()) ||
      (j.repository.url || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredArtifacts = artifacts.filter((a) => {
    const job = jobs.find((j) => j.id === a.buildJobId);
    return a.name.toLowerCase().includes(search.toLowerCase()) ||
      (job?.name || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">App Hub</h1>
        <p className="text-gray-500 text-sm mt-1">Browse and download built application binaries</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search builds or artifacts..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        {activeTab === 'builds' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BuildStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {(['builds', 'artifacts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'builds' ? `Builds (${jobs.length})` : `Artifacts (${artifacts.length})`}
          </button>
        ))}
      </div>

      {/* Builds Tab */}
      {activeTab === 'builds' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Project</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Agent</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Platform</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    No builds found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const agent = getAgentById(job.agentId);
                  return (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{job.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-xs">{job.repository.url || job.repository.archiveName}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{agent?.name}</td>
                      <td className="px-4 py-3 text-gray-600">{getPlatformLabel(job.platform)}</td>
                      <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(job.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/builds/${job.id}`}
                          className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-xs font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Artifacts Tab */}
      {activeTab === 'artifacts' && (
        <div className="grid gap-3">
          {filteredArtifacts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No artifacts found</p>
            </div>
          ) : (
            filteredArtifacts.map((artifact) => {
              const job = jobs.find((j) => j.id === artifact.buildJobId);
              return (
                <div key={artifact.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{artifact.name}</span>
                      {artifact.version && (
                        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">v{artifact.version}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatBytes(artifact.size)} · {getPlatformLabel(artifact.platform)} · {formatDate(artifact.createdAt)}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{artifact.checksum}</p>
                    {job && (
                      <Link to={`/builds/${job.id}`} className="text-xs text-primary-600 hover:underline mt-1 inline-block">
                        From: {job.name}
                      </Link>
                    )}
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
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
