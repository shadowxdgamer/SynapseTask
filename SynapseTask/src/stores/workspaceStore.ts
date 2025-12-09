import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace, CreateWorkspaceInput } from '../types';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  
  // Actions
  setActiveWorkspace: (id: string) => void;
  createWorkspace: (input: CreateWorkspaceInput) => Workspace;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  reorderWorkspaces: (workspaces: Workspace[]) => void;
  getActiveWorkspace: () => Workspace | undefined;
}

const DEFAULT_WORKSPACE: Workspace = {
  id: 'default',
  name: 'My Tasks',
  icon: '📋',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  order: 0,
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [DEFAULT_WORKSPACE],
      activeWorkspaceId: 'default',

      setActiveWorkspace: (id) => {
        set({ activeWorkspaceId: id });
      },

      createWorkspace: (input) => {
        const newWorkspace: Workspace = {
          id: crypto.randomUUID(),
          name: input.name,
          icon: input.icon || '📁',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          order: get().workspaces.length,
        };
        
        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace],
          activeWorkspaceId: newWorkspace.id,
        }));
        
        return newWorkspace;
      },

      updateWorkspace: (id, updates) => {
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: Date.now() } : w
          ),
        }));
      },

      deleteWorkspace: (id) => {
        const { workspaces, activeWorkspaceId } = get();
        
        // Don't delete the last workspace
        if (workspaces.length <= 1) return;
        
        const newWorkspaces = workspaces.filter((w) => w.id !== id);
        
        set({
          workspaces: newWorkspaces,
          // If we deleted the active workspace, switch to the first one
          activeWorkspaceId:
            activeWorkspaceId === id ? newWorkspaces[0].id : activeWorkspaceId,
        });
      },

      reorderWorkspaces: (workspaces) => {
        set({
          workspaces: workspaces.map((w, index) => ({ ...w, order: index })),
        });
      },

      getActiveWorkspace: () => {
        const { workspaces, activeWorkspaceId } = get();
        return workspaces.find((w) => w.id === activeWorkspaceId);
      },
    }),
    {
      name: 'synapse-workspaces',
    }
  )
);
