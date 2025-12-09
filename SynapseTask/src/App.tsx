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
          
          <div className="flex-1 flex overflow-hidden relative">
            {/* Main content area */}
            <div className="flex-1 overflow-auto p-4">
              {view === 'kanban' && <KanbanBoard />}
              {view === 'list' && <ListView />}
              {view === 'mindmap' && <MindMap />}
            </div>
            
            {/* Widgets panel - slides over content with curved top */}
            <div 
              className={`absolute top-0 right-0 h-full w-80 transition-transform duration-300 ease-in-out z-50 ${showWidgets ? 'translate-x-0' : 'translate-x-full'}`}
            >
              {/* Main panel content with curved top-left */}
              <div className="h-full w-full bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-xl rounded-tl-[3rem] border-l border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="w-80 p-4 pt-8 space-y-4 overflow-y-auto h-full custom-scrollbar">
                  <PomodoroTimer />
                  <LofiPlayer />
                </div>
              </div>
            </div>
          </div>
          
          {/* Widget toggle button */}
          <button
            onClick={() => setShowWidgets(!showWidgets)}
            className={`absolute top-1/2 transform -translate-y-1/2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-l-lg p-2 shadow-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-300 z-50 ${showWidgets ? 'right-80' : 'right-0'}`}
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
