import Header from "@/components/Header";
import { Key, Globe, User, Bell, Shield, Github, Globe as GitLab, Smartphone, Laptop, Monitor } from 'lucide-react';

export default function Settings() {
  const agents = [
    { name: 'Google Jules', connected: true },
    { name: 'Cursor Agent', connected: false },
    { name: 'Codemagic.io', connected: true },
    { name: 'GitHub Copilot Agents', connected: false },
    { name: 'AMP Remote', connected: true },
  ];

  return (
    <>
      <Header title="Settings" />
      <main className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
              {[
                { name: 'API Configurations', icon: Key, active: true },
                { name: 'General Settings', icon: Globe, active: false },
                { name: 'Account Management', icon: User, active: false },
                { name: 'Notifications', icon: Bell, active: false },
                { name: 'Security', icon: Shield, active: false },
              ].map((item) => (
                <button
                  key={item.name}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    item.active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 space-y-12">
            <section>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">API Configurations</h3>
              <p className="text-slate-500 text-sm mb-6">Manage API keys and connections for AI build agents.</p>

              <div className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.name} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`size-3 rounded-full ${agent.connected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <div>
                        <h4 className="font-bold dark:text-white">{agent.name}</h4>
                        <p className="text-xs text-slate-500">{agent.connected ? 'Connected' : 'Not configured'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="password"
                        value={agent.connected ? '••••••••••••••••' : ''}
                        readOnly
                        placeholder="Enter API Key"
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 w-full md:w-64"
                      />
                      <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        {agent.connected ? 'Update' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Default Build Platform</h3>
              <p className="text-slate-500 text-sm mb-6">Choose the default target platform for new build jobs.</p>
              <div className="flex gap-4">
                {[
                  { id: 'linux', name: 'Linux', icon: Laptop },
                  { id: 'macos', name: 'macOS', icon: Smartphone },
                  { id: 'windows', name: 'Windows', icon: Monitor },
                ].map((p) => (
                  <button key={p.id} className={`flex flex-col items-center gap-3 p-6 border-2 rounded-xl transition-all ${
                    p.id === 'linux' ? 'border-blue-600 bg-blue-600/5' : 'border-transparent bg-slate-50 dark:bg-slate-800'
                  }`}>
                    <p.icon size={24} className={p.id === 'linux' ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="text-sm font-bold dark:text-white">{p.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Connected Accounts</h3>
              <p className="text-slate-500 text-sm mb-6">Manage your connections to version control providers.</p>
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-10 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                      <Github size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold dark:text-white">GitHub</h4>
                      <p className="text-sm text-slate-500">Connected as @alex-rivera</p>
                    </div>
                  </div>
                  <button className="text-rose-500 text-sm font-bold hover:underline">Disconnect</button>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="size-10 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                      <GitLab size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold dark:text-white">GitLab</h4>
                      <p className="text-sm text-slate-500">Not connected</p>
                    </div>
                  </div>
                  <button className="text-blue-600 text-sm font-bold hover:underline">Connect</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
