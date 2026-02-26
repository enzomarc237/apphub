import Header from "@/components/Header";
import { Download, Search, Filter, Apple, Monitor, Laptop, Bot, MoreVertical, Share2 } from 'lucide-react';

const artifacts = [
  { id: 1, name: 'Project Phoenix', version: 'v1.4.2', platform: 'macOS', icon: Apple, date: 'Feb 24, 2024', agent: 'Google Jules', size: '124 MB' },
  { id: 2, name: 'Auth System', version: 'v2.1.0-rc', platform: 'Linux', icon: Laptop, date: 'Feb 23, 2024', agent: 'Cursor Agent', size: '45 MB' },
  { id: 3, name: 'Data Processor', version: 'v0.9.5', platform: 'Windows', icon: Monitor, date: 'Feb 22, 2024', agent: 'Codemagic', size: '210 MB' },
  { id: 4, name: 'Mobile API', version: 'v1.0.0', platform: 'macOS', icon: Apple, date: 'Feb 21, 2024', agent: 'Google Jules', size: '89 MB' },
  { id: 5, name: 'Analytics Hub', version: 'v3.2.1', platform: 'Linux', icon: Laptop, date: 'Feb 20, 2024', agent: 'GitHub Copilot', size: '156 MB' },
  { id: 6, name: 'Edge Gateway', version: 'v1.2.0', platform: 'Linux', icon: Laptop, date: 'Feb 19, 2024', agent: 'Google Jules', size: '32 MB' },
];

export default function ArtifactHub() {
  return (
    <>
      <Header title="Artifact Hub" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search artifacts..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Filter size={18} /> Filters
            </button>
          </div>
          <p className="text-sm text-slate-500 font-medium">128 Artifacts total</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artifacts.map((artifact) => (
            <div key={artifact.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="size-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
                  <artifact.icon size={28} />
                </div>
                <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{artifact.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-slate-500">{artifact.version}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-sm font-medium text-slate-500">{artifact.platform}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Build Date</span>
                  <span className="text-sm font-medium dark:text-slate-300">{artifact.date}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Size</span>
                  <span className="text-sm font-medium dark:text-slate-300">{artifact.size}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <Bot size={16} className="text-blue-600" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Built by {artifact.agent}</span>
              </div>

              <div className="flex gap-2 mt-auto">
                <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold transition-all">
                  <Download size={16} /> Download
                </button>
                <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <button className="px-6 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Load More Artifacts
          </button>
        </div>
      </main>
    </>
  );
}
