import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Note {
  id: string;
  workspaceId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface NotesState {
  notesByWorkspace: Record<string, Note[]>;
  
  // Actions
  getNotes: (workspaceId: string) => Note[];
  createNote: (workspaceId: string, content?: string) => Note;
  updateNote: (workspaceId: string, noteId: string, content: string) => void;
  deleteNote: (workspaceId: string, noteId: string) => void;
  
  // Quick note (scratchpad per workspace)
  quickNotes: Record<string, string>;
  getQuickNote: (workspaceId: string) => string;
  setQuickNote: (workspaceId: string, content: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notesByWorkspace: {},
      quickNotes: {},

      getNotes: (workspaceId) => {
        return get().notesByWorkspace[workspaceId] || [];
      },

      createNote: (workspaceId, content = '') => {
        const newNote: Note = {
          id: crypto.randomUUID(),
          workspaceId,
          content,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          notesByWorkspace: {
            ...state.notesByWorkspace,
            [workspaceId]: [...(state.notesByWorkspace[workspaceId] || []), newNote],
          },
        }));

        return newNote;
      },

      updateNote: (workspaceId, noteId, content) => {
        set((state) => ({
          notesByWorkspace: {
            ...state.notesByWorkspace,
            [workspaceId]: (state.notesByWorkspace[workspaceId] || []).map((n) =>
              n.id === noteId ? { ...n, content, updatedAt: Date.now() } : n
            ),
          },
        }));
      },

      deleteNote: (workspaceId, noteId) => {
        set((state) => ({
          notesByWorkspace: {
            ...state.notesByWorkspace,
            [workspaceId]: (state.notesByWorkspace[workspaceId] || []).filter(
              (n) => n.id !== noteId
            ),
          },
        }));
      },

      getQuickNote: (workspaceId) => {
        return get().quickNotes[workspaceId] || '';
      },

      setQuickNote: (workspaceId, content) => {
        set((state) => ({
          quickNotes: {
            ...state.quickNotes,
            [workspaceId]: content,
          },
        }));
      },
    }),
    {
      name: 'synapse-notes',
    }
  )
);
