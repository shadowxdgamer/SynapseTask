export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  // API
  apiKey: string;
  selectedModelId: string;
  customModelId: string | null;
  enableReasoning: boolean;
  
  // Theme
  theme: Theme;
  
  // Pomodoro
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
  pomodoroAutoStart: boolean;
  
  // UI preferences
  sidebarCollapsed: boolean;
  defaultView: 'board' | 'mindmap';
}

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  selectedModelId: 'deepseek/deepseek-v3.2',
  customModelId: null,
  enableReasoning: true,
  theme: 'system',
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
  pomodoroAutoStart: false,
  sidebarCollapsed: false,
  defaultView: 'board',
};
