import React from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6 flex-1">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 placeholder:text-slate-500 dark:text-slate-100"
            placeholder="Search builds, artifacts or agents..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <Bell size={20} />
        </button>
        <Link
          href="/new-build"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
        >
          <Plus size={18} />
          New Build
        </Link>
      </div>
    </header>
  );
};

export default Header;
