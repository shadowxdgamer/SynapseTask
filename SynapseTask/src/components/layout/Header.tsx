import {
  Settings,
  Moon,
  Sun,
  LayoutGrid,
  Network,
  Menu,
  Sparkles,
  List,
} from 'lucide-react';
import { useSettingsStore, useWorkspaceStore } from '../../stores';

export function Header() {
  const { view, setTheme, setView, getEffectiveTheme, setSettingsOpen, sidebarCollapsed, setSidebarCollapsed } = useSettingsStore();
  const { getActiveWorkspace } = useWorkspaceStore();
  const activeWorkspace = getActiveWorkspace();

  const effectiveTheme = getEffectiveTheme();

  const toggleTheme = () => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Left: Logo + Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-lg text-white shadow-md">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">SynapseTask</h1>
            {activeWorkspace && (
              <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
                {activeWorkspace.icon} {activeWorkspace.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Center: View Switcher */}
      <div className="hidden sm:flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
        <button
          onClick={() => setView('kanban')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            view === 'kanban'
              ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <LayoutGrid size={16} />
          Board
        </button>
        <button
          onClick={() => setView('list')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            view === 'list'
              ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <List size={16} />
          List
        </button>
        <button
          onClick={() => setView('mindmap')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            view === 'mindmap'
              ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Network size={16} />
          Mind Map
        </button>
      </div>

      {/* Right: Theme + Settings */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {effectiveTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
