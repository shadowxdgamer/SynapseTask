import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS } from '../types/settings';

type Theme = 'light' | 'dark' | 'system';
type ViewType = 'kanban' | 'mindmap' | 'list';

interface SettingsState {
  // Settings values
  apiKey: string;
  selectedModelId: string;
  customModelId: string | null;
  enableReasoning: boolean;
  theme: Theme;
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
  pomodoroAutoStart: boolean;
  sidebarCollapsed: boolean;
  defaultView: ViewType;
  view: ViewType;
  settingsOpen: boolean;
  
  // Actions
  setApiKey: (key: string) => void;
  setSelectedModel: (modelId: string) => void;
  setCustomModel: (modelId: string | null) => void;
  setEnableReasoning: (enabled: boolean) => void;
  setTheme: (theme: Theme) => void;
  setPomodoroSettings: (focus: number, breakTime: number, autoStart: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDefaultView: (view: ViewType) => void;
  setView: (view: ViewType) => void;
  setSettingsOpen: (open: boolean) => void;
  resetSettings: () => void;
  
  // Computed
  getEffectiveTheme: () => 'light' | 'dark';
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial values
      apiKey: DEFAULT_SETTINGS.apiKey,
      selectedModelId: DEFAULT_SETTINGS.selectedModelId,
      customModelId: DEFAULT_SETTINGS.customModelId,
      enableReasoning: DEFAULT_SETTINGS.enableReasoning,
      theme: DEFAULT_SETTINGS.theme,
      pomodoroFocusMinutes: DEFAULT_SETTINGS.pomodoroFocusMinutes,
      pomodoroBreakMinutes: DEFAULT_SETTINGS.pomodoroBreakMinutes,
      pomodoroAutoStart: DEFAULT_SETTINGS.pomodoroAutoStart,
      sidebarCollapsed: DEFAULT_SETTINGS.sidebarCollapsed,
      defaultView: 'kanban',
      view: 'kanban',
      settingsOpen: false,

      setApiKey: (key) => set({ apiKey: key }),

      setSelectedModel: (modelId) => set({ selectedModelId: modelId }),

      setCustomModel: (modelId) => set({ customModelId: modelId }),

      setEnableReasoning: (enabled) => set({ enableReasoning: enabled }),

      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        const effectiveTheme = theme === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : theme;
        document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
      },

      setPomodoroSettings: (focus, breakTime, autoStart) => {
        set({
          pomodoroFocusMinutes: focus,
          pomodoroBreakMinutes: breakTime,
          pomodoroAutoStart: autoStart,
        });
      },

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setDefaultView: (view) => set({ defaultView: view }),
      
      setView: (view) => set({ view }),
      
      setSettingsOpen: (open) => set({ settingsOpen: open }),

      resetSettings: () => set({
        apiKey: DEFAULT_SETTINGS.apiKey,
        selectedModelId: DEFAULT_SETTINGS.selectedModelId,
        customModelId: DEFAULT_SETTINGS.customModelId,
        enableReasoning: DEFAULT_SETTINGS.enableReasoning,
        theme: DEFAULT_SETTINGS.theme,
        pomodoroFocusMinutes: DEFAULT_SETTINGS.pomodoroFocusMinutes,
        pomodoroBreakMinutes: DEFAULT_SETTINGS.pomodoroBreakMinutes,
        pomodoroAutoStart: DEFAULT_SETTINGS.pomodoroAutoStart,
        sidebarCollapsed: DEFAULT_SETTINGS.sidebarCollapsed,
        defaultView: 'kanban',
        view: 'kanban',
      }),

      getEffectiveTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
      },
    }),
    {
      name: 'synapse-settings',
      partialize: (state) => ({
        apiKey: state.apiKey,
        selectedModelId: state.selectedModelId,
        customModelId: state.customModelId,
        enableReasoning: state.enableReasoning,
        theme: state.theme,
        pomodoroFocusMinutes: state.pomodoroFocusMinutes,
        pomodoroBreakMinutes: state.pomodoroBreakMinutes,
        pomodoroAutoStart: state.pomodoroAutoStart,
        sidebarCollapsed: state.sidebarCollapsed,
        defaultView: state.defaultView,
      }),
    }
  )
);
