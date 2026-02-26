import Header from "@/components/Header";
import { CheckCircle2, RefreshCw, AlertCircle, Clock, Bot, Zap } from 'lucide-react';

const stats = [
  { name: 'Total Builds', value: '1,284', change: '+12.5%', color: 'text-emerald-500' },
  { name: 'Success Rate', value: '98.2%', change: '+0.5%', color: 'text-emerald-500' },
  { name: 'Active AI Agents', value: '12', change: 'Stable', color: 'text-blue-600' },
  { name: 'Storage Used', value: '45.2 GB', change: '/ 100GB', color: 'text-slate-400' },
];

const recentBuilds = [
  {
    id: 1,
    status: 'Success',
    repo: 'frontend-main',
    branch: 'production',
    agent: 'C-Coder v2',
    time: '2m 30s',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 2,
    status: 'Running',
    repo: 'auth-service',
    branch: 'feature/jwt',
    agent: 'Optimus Build',
    time: '1m 45s',
    icon: RefreshCw,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    spinning: true,
  },
  {
    id: 3,
    status: 'Failed',
    repo: 'data-pipeline',
    branch: 'master',
    agent: 'C-Coder v2',
    time: '45s',
    icon: AlertCircle,
    iconColor: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
  },
  {
    id: 4,
    status: 'Pending',
    repo: 'mobile-app',
    branch: 'ios-v2',
    agent: 'Optimus Build',
    time: '--',
    icon: Clock,
    iconColor: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
  },
];

export default function Dashboard() {
  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.name}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold dark:text-white">{stat.value}</span>
                <span className={`${stat.color} text-xs font-bold`}>{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Builds</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Repository Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Agent</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Build Time</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {recentBuilds.map((build) => (
                  <tr key={build.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 ${build.iconColor} ${build.bgColor} px-2 py-1 rounded-full w-fit`}>
                        <build.icon size={14} className={build.spinning ? 'animate-spin' : ''} />
                        <span className="text-xs font-bold uppercase tracking-wide">{build.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{build.repo}</span>
                        <span className="text-xs text-slate-500">branch: {build.branch}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        {build.agent.includes('Optimus') ? <Zap size={18} /> : <Bot size={18} />}
                        <span className="text-sm">{build.agent}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{build.time}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-bold">
                        {build.status === 'Running' ? 'Stop' : build.status === 'Failed' ? 'Retry' : 'Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500">Showing 4 of 1,284 recent builds</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl text-white">
            <h4 className="font-bold text-lg">Integrate AI Agents</h4>
            <p className="text-white/80 text-sm mt-1">Supercharge your CI/CD pipelines with our pre-trained C-Coder and Optimus models.</p>
            <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">Documentation</button>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white">Need support?</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Our technical team is available 24/7 for build troubleshooting.</p>
            <button className="mt-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Contact Support</button>
          </div>
        </div>
      </main>
    </>
  );
}
