import Header from "@/components/Header";
import { Download, XCircle, Clock, ExternalLink, Bot, Apple, Terminal } from 'lucide-react';

export default function BuildProgress() {
  const logs = [
    { time: '10:00:01', msg: 'Initializing sandbox environment...', type: 'info' },
    { time: '10:00:05', msg: 'Pulling source code from github.com/alex-rivera/frontend-main...', type: 'info' },
    { time: '10:00:12', msg: 'AI Agent "Google Jules" analyzing dependencies...', type: 'agent' },
    { time: '10:00:18', msg: 'Detected React v18, Next.js v14, TailwindCSS v3', type: 'info' },
    { time: '10:00:20', msg: 'Running "npm install"...', type: 'info' },
    { time: '10:00:45', msg: 'Warning: 2 vulnerabilities found in sub-dependencies', type: 'warn' },
    { time: '10:00:46', msg: 'Google Jules: Resolving security vulnerabilities...', type: 'agent' },
    { time: '10:01:05', msg: 'Starting build process for target: macOS (arm64)...', type: 'info' },
    { time: '10:01:10', msg: 'Compiling assets...', type: 'info' },
    { time: '10:01:45', msg: 'Generating optimized production build...', type: 'info' },
    { time: '10:02:15', msg: 'Finalizing binary artifact...', type: 'info' },
    { time: '10:02:30', msg: 'Build Successful!', type: 'success' },
  ];

  return (
    <>
      <Header title="Build Progress" />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-8 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-wider">Success</span>
              </div>
              <h3 className="text-xl font-bold dark:text-white">frontend-main</h3>
              <span className="text-slate-500 text-sm">#BLD-8291</span>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-rose-500 border border-rose-500 hover:bg-rose-500/10 transition-colors">
                <XCircle size={18} /> Cancel Build
              </button>
              <button className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all">
                <Download size={18} /> Download Binary
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden font-mono text-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal size={16} />
                <span>Live Build Logs</span>
              </div>
              <span className="text-xs text-slate-500">Auto-scrolling enabled</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-slate-600 shrink-0">{log.time}</span>
                  <span className={`
                    ${log.type === 'info' ? 'text-slate-300' : ''}
                    ${log.type === 'warn' ? 'text-amber-400' : ''}
                    ${log.type === 'agent' ? 'text-blue-400 font-bold' : ''}
                    ${log.type === 'success' ? 'text-emerald-400 font-bold' : ''}
                  `}>
                    {log.msg}
                  </span>
                </div>
              ))}
              <div className="h-4 animate-pulse bg-slate-800/50 w-2 mt-2" />
            </div>
          </div>
        </div>

        <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 space-y-8 overflow-y-auto">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Build Metadata</h4>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">Repository</span>
                <a href="#" className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:underline">
                  alex-rivera/frontend-main <ExternalLink size={12} />
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">AI Agent</span>
                <div className="flex items-center gap-2 mt-1">
                  <Bot size={16} className="text-blue-600" />
                  <span className="text-sm font-medium dark:text-white">Google Jules v1.2</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">Platform</span>
                <div className="flex items-center gap-2 mt-1">
                  <Apple size={16} className="text-slate-400" />
                  <span className="text-sm font-medium dark:text-white">macOS (arm64)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Timestamps</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={14} />
                  <span className="text-xs">Started</span>
                </div>
                <span className="text-xs font-medium dark:text-white">10:00:01 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={14} />
                  <span className="text-xs">Duration</span>
                </div>
                <span className="text-xs font-medium dark:text-white">2m 29s</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}
