import { Link } from 'react-router-dom';
import { useBuildStore } from '@/store/buildStore';
import { useAuthStore } from '@/store/authStore';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, getPlatformLabel } from '@/lib/utils';
import { getAgentById } from '@/lib/agents';
import { Plus, Package, Clock, CheckCircle, XCircle, PlayCircle } from 'lucide-react';

export default function DashboardPage() {
  const jobs = useBuildStore((s) => s.jobs);
  const user = useAuthStore((s) => s.user);

  const stats = {
    total: jobs.length,
    running: jobs.filter((j) => j.status === 'running' || j.status === 'queued' || j.status === 'pending').length,
    success: jobs.filter((j) => j.status === 'success').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
  };

  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {user?.name || 'Developer'}
          </p>
        </div>
        <Link
          to="/submit"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Build
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Builds</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.running}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.success}</p>
              <p className="text-sm text-gray-500">Successful</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Builds */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Builds</h2>
          <Link to="/hub" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentJobs.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No builds yet. Start by submitting your first project.</p>
              <Link to="/submit" className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline">
                <Plus className="w-3.5 h-3.5" /> Submit a build
              </Link>
            </div>
          ) : (
            recentJobs.map((job) => {
              const agent = getAgentById(job.agentId);
              return (
                <Link
                  key={job.id}
                  to={`/builds/${job.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{job.name}</p>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {agent?.name} · {getPlatformLabel(job.platform)} · {job.repository.url || job.repository.archiveName}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(job.createdAt)}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
