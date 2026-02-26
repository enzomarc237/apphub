import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Layers,
  Bot,
  Package,
  Settings,
  Rocket
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <Rocket size={24} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight">AppHub</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">Build Automation</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600/10 text-blue-600">
          <LayoutDashboard size={20} />
          <p className="text-sm font-medium">Dashboard</p>
        </Link>
        <Link href="/projects" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Layers size={20} />
          <p className="text-sm font-medium">Projects</p>
        </Link>
        <Link href="/agents" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bot size={20} />
          <p className="text-sm font-medium">AI Agents</p>
        </Link>
        <Link href="/artifacts" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Package size={20} />
          <p className="text-sm font-medium">Artifact Hub</p>
        </Link>
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Settings size={20} />
            <p className="text-sm font-medium">Settings</p>
          </Link>
        </div>
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center" />
          <div className="flex flex-col">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Alex Rivera</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
