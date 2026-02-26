import Header from "@/components/Header";
import { Github, Globe, Bot, Monitor, Cpu, Terminal, Plus } from 'lucide-react';

export default function NewBuild() {
  return (
    <>
      <Header title="New Build" />
      <main className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Repository Source</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button className="flex items-center gap-4 p-4 border-2 border-blue-600 bg-blue-600/5 rounded-xl text-left transition-all">
                <div className="size-12 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                  <Github size={28} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">GitHub</p>
                  <p className="text-sm text-slate-500">Connected: alex-rivera</p>
                </div>
              </button>
              <button className="flex items-center gap-4 p-4 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-left transition-all">
                <div className="size-12 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                  <Globe size={28} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">GitLab</p>
                  <p className="text-sm text-slate-500">Not connected</p>
                </div>
              </button>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Repository URL</label>
              <input
                type="text"
                placeholder="https://github.com/username/project"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">AI Agent Selection</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Google Jules', icon: Bot, active: true },
                { name: 'Cursor Agent', icon: Terminal, active: false },
                { name: 'Codemagic', icon: Cpu, active: false },
                { name: 'GitHub Copilot', icon: Monitor, active: false },
              ].map((agent) => (
                <button
                  key={agent.name}
                  className={`flex flex-col items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                    agent.active
                      ? 'border-blue-600 bg-blue-600/5'
                      : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <agent.icon size={32} className={agent.active ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="text-sm font-bold dark:text-white text-center">{agent.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Target Platform</h3>
            <div className="flex flex-wrap gap-4">
              {['Linux', 'macOS', 'Windows'].map((platform) => (
                <button
                  key={platform}
                  className={`px-6 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                    platform === 'macOS'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Environment Variables</h3>
              <button className="flex items-center gap-2 text-blue-600 text-sm font-bold hover:underline">
                <Plus size={16} /> Add Variable
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="NODE_ENV" className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none" />
                <input type="text" placeholder="production" className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="API_VERSION" className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none" />
                <input type="text" placeholder="v2" className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none" />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-4">
            <button className="px-8 py-3 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button className="px-12 py-3 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all">
              Start Build
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
