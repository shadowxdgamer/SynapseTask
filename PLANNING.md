# SynapseTask - Development Planning Document

> **Created:** December 9, 2025  
> **Status:** Ready for Development  
> **Stack:** React + TypeScript + SWC + Vite  
> **State Management:** Zustand  
> **AI Optimization:** TOON (Token-Optimized Object Notation)

---

## 📋 Executive Summary

SynapseTask is being rebuilt as a comprehensive, privacy-first productivity suite. 

**Vision:** *"The sweet spot between Notion (too complex) and Trello (too simple)"*

### Core Features:
- **Kanban Board** with drag-and-drop (@dnd-kit)
- **Mind Map Visualization** (radial SVG)
- **Multi-Page Workspaces** - Users can create separate pages/boards
- **Custom Categories** - Full control, delete defaults, create new
- **Pomodoro Timer** 
- **Lofi Music Player** - YouTube streams + custom URLs
- **Notes/Scratchpad** 
- **AI Integration** - User-selectable models via OpenRouter (DeepSeek default)
- **LaTeX Report Generation**
- **Dark Mode** 🌙

---

## 🔍 Current Issues Identified

| Issue | Description | Priority |
|-------|-------------|----------|
| **Mind Map Broken** | SVG visualization not rendering correctly | 🔴 Critical |
| **Hardcoded Model** | Uses `meta-llama/llama-3-8b-instruct:free` only | 🔴 Critical |
| **No TypeScript** | Current MVP is plain JavaScript | 🟡 Medium |
| **Single File** | 700+ lines in one file, hard to maintain | 🟡 Medium |
| **Missing Features** | Lofi player, Notes, LaTeX reports not implemented | 🟡 Medium |

---

## 🏗️ Architecture Decision: Fresh TypeScript Project

### Why Rebuild?

1. **Type Safety**: Better developer experience, catch errors early
2. **Scalability**: Proper folder structure from the start
3. **Modern Patterns**: Custom hooks, context providers, proper state management
4. **Current State**: Existing `SynapseTask/` folder is just Vite boilerplate anyway

### Confirmed Tech Stack ✅

| Layer | Technology | Reason |
|-------|------------|--------|
| **Framework** | React 19 + TypeScript + SWC | Type safety, fast compilation |
| **Build Tool** | Vite | Fast HMR, excellent DX |
| **Styling** | Tailwind CSS v4 | Utility-first, matches existing design |
| **DnD** | @dnd-kit/core ✅ | Modern, accessible, well-maintained |
| **Icons** | Lucide React | Consistent, tree-shakeable |
| **State** | Zustand ✅ | Lightweight, TypeScript-first, confirmed |
| **Persistence** | localStorage + custom hooks | Privacy-first, no backend |
| **DnD** | @dnd-kit/core | Modern, accessible drag-and-drop |
| **Audio** | Howler.js | Lofi music player |
| **AI Protocol** | TOON | Token-optimized data exchange |
| **Theme** | Light + Dark Mode | User preference |

---

## 📁 Proposed Project Structure

```
SynapseTask/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx       # Workspace pages list
│   │   │   ├── AppDrawer.tsx     # Bottom drawer (lofi, timer)
│   │   │   └── Modal.tsx
│   │   ├── board/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── Column.tsx
│   │   │   └── TaskCard.tsx
│   │   ├── mindmap/
│   │   │   ├── MindMap.tsx
│   │   │   ├── MindMapNode.tsx
│   │   │   └── MindMapConnection.tsx
│   │   ├── workspace/
│   │   │   ├── WorkspaceList.tsx
│   │   │   ├── WorkspaceCard.tsx
│   │   │   └── CreateWorkspace.tsx
│   │   ├── widgets/
│   │   │   ├── PomodoroTimer.tsx
│   │   │   ├── LofiPlayer.tsx    # YouTube embed + custom URLs
│   │   │   └── CategorySummary.tsx
│   │   ├── notes/
│   │   │   └── NotesPanel.tsx
│   │   ├── settings/
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── ModelSelector.tsx
│   │   │   ├── CategoryManager.tsx  # CRUD for categories
│   │   │   └── ThemeToggle.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Badge.tsx
│   │       └── ColorPicker.tsx   # For custom categories
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useTasks.ts
│   │   ├── useWorkspaces.ts      # Multi-page management
│   │   ├── useCategories.ts      # Custom categories
│   │   ├── useOpenRouter.ts
│   │   ├── useModels.ts
│   │   ├── usePomodoro.ts
│   │   ├── useLofi.ts            # Lofi player state
│   │   ├── useTheme.ts           # Dark mode
│   │   └── useToon.ts            # TOON parsing middleware
│   ├── services/
│   │   └── openrouter.ts         # API client
│   ├── stores/
│   │   ├── taskStore.ts          # Zustand store
│   │   ├── workspaceStore.ts     # Multi-page state
│   │   ├── categoryStore.ts      # Custom categories
│   │   ├── settingsStore.ts
│   │   ├── lofiStore.ts          # Lofi player state
│   │   └── notesStore.ts
│   ├── types/
│   │   ├── index.ts              # Re-export all types
│   │   ├── task.ts
│   │   ├── workspace.ts
│   │   ├── category.ts
│   │   ├── lofi.ts
│   │   ├── model.ts
│   │   └── settings.ts
│   ├── utils/
│   │   ├── categories.ts
│   │   ├── prompts.ts            # AI prompt templates
│   │   ├── latex.ts              # LaTeX generation helpers
│   │   └── toon.ts               # TOON <-> JS conversion
│   ├── constants/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── eslint.config.js
```

---

## 📦 Core Data Types

### Workspace (Multi-Page Support)
```typescript
interface Workspace {
  id: string;
  name: string;
  icon: string;              // Emoji or Lucide icon name
  createdAt: number;
  updatedAt: number;
  order: number;             // For drag-to-reorder pages
}

// Each workspace has its own tasks, stored separately
// localStorage key: `synapse-tasks-${workspaceId}`
```

### Task
```typescript
interface Task {
  id: string;
  workspaceId: string;       // Which page this task belongs to
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  categoryId: string;        // Reference to custom category
  timeEstimate: string | null;  // e.g., "30m", "2h"
  timeSpent: number;            // in minutes (for reports)
  createdAt: number;
  completedAt: number | null;
}
```

### Custom Categories
```typescript
interface Category {
  id: string;
  name: string;
  color: string;             // Tailwind color class or hex
  icon?: string;             // Optional emoji or icon
  isDefault: boolean;        // User can delete non-defaults
  order: number;
}

// Default categories (user can delete/modify all of these)
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: 'purple', isDefault: true, order: 0 },
  { id: 'personal', name: 'Personal', color: 'green', isDefault: true, order: 1 },
  { id: 'health', name: 'Health', color: 'rose', isDefault: true, order: 2 },
  { id: 'study', name: 'Study', color: 'blue', isDefault: true, order: 3 },
  { id: 'finance', name: 'Finance', color: 'emerald', isDefault: true, order: 4 },
  { id: 'creative', name: 'Creative', color: 'orange', isDefault: true, order: 5 },
];
// Note: No "Other" forced - user has full control
```

### Lofi Player
```typescript
interface LofiStream {
  id: string;
  name: string;
  url: string;               // YouTube URL or direct stream
  type: 'youtube' | 'direct';
  isCustom: boolean;         // User-added vs default
}

interface LofiPlayerState {
  streams: LofiStream[];
  currentStreamId: string | null;
  isPlaying: boolean;
  volume: number;            // 0-100
  isMinimized: boolean;      // Collapsed in drawer
}

// Default streams (user can add custom)
const DEFAULT_STREAMS: LofiStream[] = [
  { id: 'lofi-girl', name: 'Lofi Girl', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', type: 'youtube', isCustom: false },
  { id: 'chillhop', name: 'Chillhop', url: 'https://www.youtube.com/watch?v=5yx6BWlEVcY', type: 'youtube', isCustom: false },
  { id: 'jazz-hop', name: 'Jazz Hop Cafe', url: 'https://www.youtube.com/watch?v=e3L1PIY1pN8', type: 'youtube', isCustom: false },
];
```

### OpenRouter Model
```typescript
interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  supported_parameters: string[];
}

interface ModelSelectorState {
  models: OpenRouterModel[];
  selectedModelId: string;       // Default: 'deepseek/deepseek-v3.2'
  customModelId: string | null;  // User can input custom model ID
  isLoading: boolean;
  error: string | null;
}
```

### Settings
```typescript
interface AppSettings {
  apiKey: string;
  selectedModelId: string;
  enableReasoning: boolean;       // For DeepSeek V3.2
  theme: 'light' | 'dark';
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
}
```

---

## 🔌 OpenRouter Integration

### Model Fetching
```typescript
// GET https://openrouter.ai/api/v1/models
// Returns list of available models for user to select

const fetchModels = async (): Promise<OpenRouterModel[]> => {
  const response = await fetch('https://openrouter.ai/api/v1/models');
  const data = await response.json();
  return data.data;
};
```

### AI Request Pattern (with Reasoning Support)
```typescript
interface AIRequest {
  model: string;
  messages: Message[];
  reasoning?: { enabled: boolean };  // For models like DeepSeek V3.2
}

const callAI = async (
  apiKey: string,
  model: string,
  messages: Message[],
  enableReasoning = false
) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'SynapseTask'
    },
    body: JSON.stringify({
      model,
      messages,
      ...(enableReasoning && { reasoning: { enabled: true } })
    })
  });
  return response.json();
};
```

### Recommended Models for SynapseTask

| Model | Use Case | Cost | Reasoning |
|-------|----------|------|-----------|
| `deepseek/deepseek-v3.2` | Complex task breakdown | $0.26/$0.39 per 1M | ✅ Yes |
| `meta-llama/llama-3-8b-instruct:free` | Simple tasks | Free | ❌ No |
| `openai/gpt-5.1-codex-max` | LaTeX generation | $1.25/$10 per 1M | ✅ Yes |
| `essentialai/rnj-1-instruct` | Budget option | $0.15/$0.15 per 1M | ❌ No |

---

## 🎯 TOON: Token-Optimized Object Notation

### What is TOON?

TOON is a minimalist notation for AI communication that reduces token consumption by ~40-60% compared to JSON. It uses single-character keys and minimal syntax.

### Why TOON?

| Format | Tokens (approx) | Cost Impact |
|--------|-----------------|-------------|
| JSON (verbose) | 100 tokens | Baseline |
| JSON (minified) | 75 tokens | -25% |
| TOON | 40-50 tokens | -50% |

### TOON Syntax Rules

```
TOON Format:
- No quotes around strings (unless they contain special chars)
- Single-letter keys for common fields
- Pipe (|) as delimiter between objects
- Colon (:) for key-value pairs
- Comma (,) for arrays
- No brackets for single objects

Key Mappings:
  t = title
  d = description  
  s = status (0=todo, 1=inprogress, 2=done)
  p = priority (0=low, 1=medium, 2=high)
  c = category (0-6 index)
  e = timeEstimate
  i = id
```

### Example: Task in JSON vs TOON

**JSON (89 tokens):**
```json
{
  "tasks": [
    {
      "title": "Design landing page",
      "description": "Create mockups for the new website",
      "priority": "high",
      "category": "Work",
      "timeEstimate": "2h",
      "status": "todo"
    }
  ]
}
```

**TOON (32 tokens):**
```
t:Design landing page|d:Create mockups for the new website|p:2|c:0|e:2h|s:0
```

### TOON Conversion Utilities

```typescript
// src/utils/toon.ts

// Category mapping
const CATEGORIES = ['Work', 'Personal', 'Health', 'Study', 'Finance', 'Creative', 'Other'] as const;
const PRIORITIES = ['low', 'medium', 'high'] as const;
const STATUSES = ['todo', 'inprogress', 'done'] as const;

// Convert Task array to TOON string (for sending to AI)
export function tasksToToon(tasks: Task[]): string {
  return tasks.map(task => 
    `i:${task.id}|t:${task.title}|d:${task.description}|s:${STATUSES.indexOf(task.status)}|p:${PRIORITIES.indexOf(task.priority)}|c:${CATEGORIES.indexOf(task.category)}|e:${task.timeEstimate || ''}`
  ).join('\n');
}

// Parse TOON string to Task array (from AI response)
export function toonToTasks(toon: string): Partial<Task>[] {
  return toon.trim().split('\n').map(line => {
    const pairs = line.split('|');
    const obj: Record<string, string> = {};
    
    pairs.forEach(pair => {
      const [key, ...valueParts] = pair.split(':');
      obj[key] = valueParts.join(':'); // Handle colons in values
    });
    
    return {
      id: obj.i || crypto.randomUUID(),
      title: obj.t || '',
      description: obj.d || '',
      status: STATUSES[parseInt(obj.s) || 0],
      priority: PRIORITIES[parseInt(obj.p) || 1],
      category: CATEGORIES[parseInt(obj.c) || 0],
      timeEstimate: obj.e || null,
    };
  });
}

// Validate TOON format
export function isValidToon(str: string): boolean {
  const lines = str.trim().split('\n');
  return lines.every(line => 
    line.includes('|') && line.includes(':')
  );
}
```

### useToon Hook

```typescript
// src/hooks/useToon.ts

import { toonToTasks, tasksToToon, isValidToon } from '../utils/toon';
import type { Task } from '../types/task';

export function useToon() {
  // Parse AI response - handles both TOON and JSON fallback
  const parseAIResponse = (content: string): Partial<Task>[] => {
    const cleaned = content
      .replace(/```toon/g, '')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Try TOON first
    if (isValidToon(cleaned)) {
      return toonToTasks(cleaned);
    }
    
    // Fallback to JSON
    try {
      const json = JSON.parse(cleaned);
      return json.tasks || json.updatedTasks || [];
    } catch {
      console.error('Failed to parse AI response:', cleaned);
      return [];
    }
  };

  // Prepare tasks for AI prompt
  const prepareForAI = (tasks: Task[]): string => {
    return tasksToToon(tasks);
  };

  return { parseAIResponse, prepareForAI, toonToTasks, tasksToToon };
}
```

### Updated AI Prompts with TOON

**Magic Add Prompt:**
```typescript
const magicAddPrompt = (input: string) => `
Analyze: "${input}"
Return tasks in TOON format (one per line):
t:title|d:description|p:0-2(low-high)|c:0-6(Work,Personal,Health,Study,Finance,Creative,Other)|e:time|s:0

Example:
t:Buy groceries|d:Milk eggs bread|p:1|c:1|e:30m|s:0
t:Call dentist|d:Schedule checkup|p:2|c:2|e:15m|s:0
`;
```

**Auto-Organize Prompt:**
```typescript
const organizePrompt = (tasksToon: string) => `
Organize these tasks. Update priority(p), category(c), timeEstimate(e).
Keep id(i) and title(t) unchanged.

Input:
${tasksToon}

Return TOON with updates only (i:id|p:new|c:new|e:new):
`;
```

### Token Savings Estimate

| Operation | JSON Tokens | TOON Tokens | Savings |
|-----------|-------------|-------------|---------|
| Magic Add (5 tasks) | ~250 | ~100 | 60% |
| Auto-Organize (10 tasks) | ~400 | ~180 | 55% |
| LaTeX Report (20 tasks) | ~800 | ~350 | 56% |

**Monthly Savings Example:**
- 100 AI calls/month × average 200 tokens saved = 20,000 tokens saved
- At $0.26/1M tokens = $0.005 saved (minimal but adds up with scale)
- More importantly: **faster responses** due to smaller payload

---

## 🗺️ Mind Map Fix Strategy

### Current Problem
The SVG-based mind map has issues with:
1. Dynamic dimension calculation
2. Node positioning algorithm
3. Responsiveness

### Proposed Solution
```typescript
// Use a proper layout algorithm
interface MindMapNode {
  id: string;
  type: 'goal' | 'category' | 'task';
  label: string;
  x: number;
  y: number;
  parentId: string | null;
  children: string[];
}

// Layout calculation using radial tree algorithm
const calculateLayout = (tasks: Task[], containerSize: Size): MindMapNode[] => {
  // 1. Create hierarchy: Goal -> Categories -> Tasks
  // 2. Calculate angles based on category distribution
  // 3. Position nodes using polar coordinates
  // 4. Convert to Cartesian for SVG rendering
};
```

### Mind Map Features
- [ ] Zoomable/pannable canvas
- [ ] Click node to view/edit task
- [ ] Animated connections
- [ ] Color-coded by status (todo=gray, inprogress=blue, done=green)
- [ ] Responsive to container resize

---

## 🎵 Lofi Player Feature (App Drawer)

### Location
- Lives in a collapsible **App Drawer** at the bottom-right
- Minimized state: Small floating button with play/pause
- Expanded state: Stream selector, volume, custom URL input

### Implementation
```typescript
// YouTube Embed Strategy
// Use YouTube IFrame API for livestreams
// Extract video ID from URL and embed

const extractYouTubeId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Component renders hidden iframe for audio-only playback
// User can add custom YouTube URLs or direct audio streams
```

### Default Streams
| Name | URL | Type |
|------|-----|------|
| Lofi Girl | `youtube.com/watch?v=jfKfPfyJRdk` | YouTube Live |
| Chillhop | `youtube.com/watch?v=5yx6BWlEVcY` | YouTube Live |
| Jazz Hop Cafe | `youtube.com/watch?v=e3L1PIY1pN8` | YouTube Live |

### User Custom URLs
- User can add any YouTube URL (live or video)
- User can add direct audio stream URLs (.mp3, .ogg)
- Custom streams saved to localStorage

---

## 📄 Multi-Page Workspaces

### Concept
Users can create multiple "pages" or "workspaces", each with its own:
- Kanban board
- Tasks
- Notes

Think of it like Notion pages but simpler.

### UI/UX
- **Sidebar** shows list of workspaces
- Click to switch between workspaces
- Drag to reorder
- Right-click for rename/delete
- "+" button to create new workspace

### Data Storage
```typescript
// Each workspace stored separately for performance
localStorage.setItem('synapse-workspaces', JSON.stringify(workspaces));
localStorage.setItem(`synapse-tasks-${workspaceId}`, JSON.stringify(tasks));
localStorage.setItem(`synapse-notes-${workspaceId}`, JSON.stringify(notes));
```

### Default Workspace
- App creates a "My Tasks" workspace on first load
- User cannot delete the last remaining workspace

---

## 🏷️ Custom Categories

### Concept
Users have FULL control over categories:
- Delete any default category
- Create new categories with custom name/color
- Reorder categories
- Assign custom icons (emoji)

### Category Manager UI
- Lives in Settings modal
- List of categories with drag handles
- Color picker for each
- Delete button (with confirmation if tasks use it)
- "Add Category" button at bottom

### Orphan Task Handling
When a category is deleted:
1. Show confirmation: "X tasks use this category"
2. Options: 
   - Move tasks to another category (dropdown)
   - Delete category and set tasks to "Uncategorized"

---

## 🌙 Dark Mode

### Implementation
```typescript
// useTheme hook
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('synapse-theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('synapse-theme', theme);
  }, [theme]);

  return { theme, setTheme, toggle: () => setTheme(t => t === 'light' ? 'dark' : 'light') };
};
```

### Tailwind Config
```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  // ...
}
```

### Color Scheme
| Element | Light | Dark |
|---------|-------|------|
| Background | slate-100 | slate-900 |
| Card | white | slate-800 |
| Text | slate-800 | slate-100 |
| Primary | indigo-600 | indigo-400 |
| Border | slate-200 | slate-700 |

---

## 📝 Notes Feature

### Implementation
```typescript
interface Note {
  id: string;
  content: string;  // Markdown supported
  createdAt: number;
  updatedAt: number;
}

// AI Integration: "Convert notes to tasks"
const notesToTasksPrompt = (notes: string) => `
  Analyze these unstructured notes and extract actionable tasks.
  Notes: "${notes}"
  
  Return JSON: { "tasks": [{ title, description, priority, category, timeEstimate }] }
`;
```

---

## 📊 LaTeX Report Generation

### Workflow
1. User clicks "Generate Report" in Done column
2. AI receives completed tasks with time data
3. AI generates LaTeX code
4. User can copy/download `.tex` file

### Prompt Template
```typescript
const latexPrompt = (tasks: Task[]) => `
  Generate a professional LaTeX report for these completed tasks.
  Use the 'article' document class.
  
  Include:
  - Title: "Task Completion Report"
  - Date: ${new Date().toLocaleDateString()}
  - Summary section with total tasks and time
  - Table with columns: Task | Category | Time Estimate | Status
  - Calculate totals
  
  Tasks: ${JSON.stringify(tasks.filter(t => t.status === 'done'))}
  
  Output raw LaTeX code only, no markdown.
`;
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Days 1-2)
- [ ] Create fresh Vite + TypeScript + Tailwind project
- [ ] Set up folder structure
- [ ] Define TypeScript types
- [ ] Implement localStorage persistence hooks
- [ ] Create basic UI components (Button, Input, Modal)

### Phase 2: Core Features (Days 3-5)
- [ ] Implement Kanban board with @dnd-kit
- [ ] Create task CRUD operations
- [ ] Build Settings modal with API key input
- [ ] Integrate OpenRouter model fetching
- [ ] Implement model selector dropdown

### Phase 3: AI Integration (Days 6-7)
- [ ] Magic Add (natural language → tasks)
- [ ] Auto-Organize (refactor board)
- [ ] Support reasoning models (DeepSeek V3.2)
- [ ] Error handling and loading states

### Phase 4: Mind Map (Days 8-9)
- [ ] Implement radial tree layout algorithm
- [ ] Create SVG-based visualization
- [ ] Add zoom/pan controls
- [ ] Task click interactions
- [ ] Responsive design

### Phase 5: Widgets & Extras (Days 10-12)
- [ ] Pomodoro Timer
- [ ] Lofi Music Player (YouTube embed + custom URLs)
- [ ] Notes panel with markdown
- [ ] Notes → Tasks AI conversion
- [ ] LaTeX report generation

### Phase 6: Multi-Page & Customization (Days 13-15)
- [ ] Multi-page workspaces
- [ ] Custom categories CRUD
- [ ] Category manager UI
- [ ] Dark mode toggle

### Phase 7: Polish (Days 16-18)
- [ ] Mobile responsiveness
- [ ] PWA configuration
- [ ] Data export/import (JSON backup)
- [ ] Onboarding / empty states
- [ ] Final testing and bug fixes

---

## ✅ Decision Checklist - ALL CONFIRMED ✅

| Decision | Choice | Status |
|----------|--------|--------|
| **Language** | TypeScript + SWC | ✅ |
| **State Management** | Zustand | ✅ |
| **AI Optimization** | TOON protocol | ✅ |
| **DnD Library** | @dnd-kit | ✅ |
| **Default Model** | DeepSeek V3.2 (+ custom model input) | ✅ |
| **Lofi Source** | YouTube embed + custom URLs | ✅ |
| **Dark Mode** | Included in MVP | ✅ |
| **Categories** | Fully customizable by user | ✅ |
| **Multi-Page** | Users can create workspace pages | ✅ |

---

## 🎯 Success Criteria

The MVP is complete when:
1. ✅ Kanban board works with drag-and-drop (@dnd-kit)
2. ✅ Mind map renders correctly and updates live
3. ✅ User can select any OpenRouter model OR input custom
4. ✅ AI features (Magic Add, Auto-Organize) work with TOON
5. ✅ Pomodoro timer functions independently
6. ✅ Lofi player streams YouTube + custom URLs
7. ✅ Notes can be converted to tasks
8. ✅ All data persists in localStorage
9. ✅ No data sent to external servers (except AI inference)
10. ✅ TOON parsing works with JSON fallback
11. ✅ Users can create/manage multiple workspace pages
12. ✅ Users can create/edit/delete custom categories
13. ✅ Dark mode works properly

---

## 🎨 Product Positioning

### What SynapseTask IS:
- **Easy to use** - No learning curve, intuitive UI
- **All-in-one** - Tasks, notes, mind maps, timer, music
- **Customizable** - Your categories, your models, your way
- **Private** - Data never leaves your browser
- **Affordable** - BYOK = pay only for what you use

### What SynapseTask is NOT:
- **Not Notion** - No databases, no complex relations, no overwhelm
- **Not Trello** - Actually has AI, mind maps, timer, music, reports
- **Not a subscription trap** - No $10/month for basic AI features

### Target Users:
- Developers & students who want control
- Freelancers tracking work for clients
- Neurodivergent users who need visual + linear views
- Anyone tired of complex or feature-limited tools

---

## 📚 References

- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [dnd-kit Documentation](https://dndkit.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Lucide Icons](https://lucide.dev/)

---

> **Next Step**: Set up the fresh Vite + React + TypeScript + SWC project and install dependencies.
