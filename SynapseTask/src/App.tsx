import { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AddTaskInput } from './components/layout/AddTaskInput';
import { KanbanBoard } from './components/board/KanbanBoard';
import { ListView } from './components/list/ListView';
import { MindMap } from './components/mindmap/MindMap';
import { SettingsModal } from './components/settings/SettingsModal';
import { PomodoroTimer, LofiPlayer } from './components/widgets';
import { useSettingsStore } from './stores/settingsStore';
import { useCategoryStore } from './stores/categoryStore';
import { useWorkspaceStore } from './stores/workspaceStore';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import './index.css';

function App() {
  const { theme, view, getEffectiveTheme } = useSettingsStore();
  const { categories, initializeDefaultCategories } = useCategoryStore();
  const { workspaces, initializeDefaultWorkspace } = useWorkspaceStore();
  const [showWidgets, setShowWidgets] = useState(true);

  // Initialize defaults on first load
  useEffect(() => {
    if (categories.length === 0) {
      initializeDefaultCategories();
    }
    if (workspaces.length === 0) {
      initializeDefaultWorkspace();
    }
  }, []);

  // Apply theme on initial load and when theme changes
  useEffect(() => {
    const applyTheme = () => {
      const effectiveTheme = getEffectiveTheme();
      document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
    };
    
    applyTheme();
    
    // Listen for system theme changes if using 'system' theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme, getEffectiveTheme]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <Header />
      
      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <AddTaskInput />
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            {/* Main content area */}
            <div className="flex-1 overflow-auto p-4">
              {view === 'kanban' && <KanbanBoard />}
              {view === 'list' && <ListView />}
              {view === 'mindmap' && <MindMap />}
            </div>
            
            {/* Widgets panel */}
            <div className={`${showWidgets ? 'w-80' : 'w-0'} transition-all duration-300 border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden flex-shrink-0 z-50 relative`}>
              <div className="w-80 p-4 space-y-4 overflow-y-auto h-full custom-scrollbar">
                <PomodoroTimer />
                <LofiPlayer />
              </div>
            </div>
          </div>
          
          {/* Widget toggle button */}
          <button
            onClick={() => setShowWidgets(!showWidgets)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-l-lg p-2 shadow-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors z-10"
            style={{ right: showWidgets ? '320px' : '0' }}
            title={showWidgets ? 'Hide widgets' : 'Show widgets'}
          >
            {showWidgets ? (
              <PanelRightClose size={18} className="text-slate-500 dark:text-slate-400" />
            ) : (
              <PanelRightOpen size={18} className="text-slate-500 dark:text-slate-400" />
            )}
          </button>
        </main>
      </div>
      
      <SettingsModal />
    </div>
  );
}

export default App;
