import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '../types';

interface TaskState {
  // Tasks are stored per workspace
  tasksByWorkspace: Record<string, Task[]>;
  
  // Actions
  getTasks: (workspaceId: string) => Task[];
  getTasksByStatus: (workspaceId: string, status: TaskStatus) => Task[];
  createTask: (workspaceId: string, input: CreateTaskInput) => Task;
  updateTask: (workspaceId: string, taskId: string, updates: UpdateTaskInput) => void;
  deleteTask: (workspaceId: string, taskId: string) => void;
  moveTask: (workspaceId: string, taskId: string, newStatus: TaskStatus) => void;
  reorderTasks: (workspaceId: string, tasks: Task[]) => void;
  clearCompletedTasks: (workspaceId: string) => void;
  getTaskById: (workspaceId: string, taskId: string) => Task | undefined;
  
  // Bulk operations for AI
  bulkCreateTasks: (workspaceId: string, tasks: CreateTaskInput[]) => Task[];
  bulkUpdateTasks: (workspaceId: string, updates: { id: string; updates: UpdateTaskInput }[]) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasksByWorkspace: {},

      getTasks: (workspaceId) => {
        return get().tasksByWorkspace[workspaceId] || [];
      },

      getTasksByStatus: (workspaceId, status) => {
        const tasks = get().tasksByWorkspace[workspaceId] || [];
        return tasks.filter((t) => t.status === status);
      },

      createTask: (workspaceId, input) => {
        const newTask: Task = {
          id: crypto.randomUUID(),
          workspaceId,
          title: input.title,
          description: input.description || '',
          status: 'todo',
          priority: input.priority || 'medium',
          categoryId: input.categoryId ?? null,
          timeEstimate: input.timeEstimate ?? null,
          estimatedMinutes: input.estimatedMinutes ?? null,
          dueDate: input.dueDate ?? null,
          timeSpent: 0,
          createdAt: Date.now(),
          completedAt: null,
        };

        set((state) => ({
          tasksByWorkspace: {
            ...state.tasksByWorkspace,
            [workspaceId]: [...(state.tasksByWorkspace[workspaceId] || []), newTask],
          },
        }));

        return newTask;
      },

      updateTask: (workspaceId, taskId, updates) => {
        set((state) => ({
          tasksByWorkspace: {
            ...state.tasksByWorkspace,
            [workspaceId]: (state.tasksByWorkspace[workspaceId] || []).map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    ...updates,
                    // Set completedAt when moving to done
                    completedAt:
                      updates.status === 'done' && t.status !== 'done'
                        ? Date.now()
                        : updates.status && updates.status !== 'done'
                        ? null
                        : t.completedAt,
                  }
                : t
            ),
          },
        }));
      },

      deleteTask: (workspaceId, taskId) => {
        set((state) => ({
          tasksByWorkspace: {
            ...state.tasksByWorkspace,
            [workspaceId]: (state.tasksByWorkspace[workspaceId] || []).filter(
              (t) => t.id !== taskId
            ),
          },
        }));
      },

      moveTask: (workspaceId, taskId, newStatus) => {
        get().updateTask(workspaceId, taskId, { status: newStatus });
      },

      reorderTasks: (workspaceId, tasks) => {
        set((state) => ({
          tasksByWorkspace: {
            ...state.tasksByWorkspace,
            [workspaceId]: tasks,
          },
        }));
      },

      clearCompletedTasks: (workspaceId) => {
        set((state) => ({
          tasksByWorkspace: {
            ...state.tasksByWorkspace,
            [workspaceId]: (state.tasksByWorkspace[workspaceId] || []).filter(
              (t) => t.status !== 'done'
            ),
          },
        }));
      },

      getTaskById: (workspaceId, taskId) => {
        const tasks = get().tasksByWorkspace[workspaceId] || [];
        return tasks.find((t) => t.id === taskId);
      },

      bulkCreateTasks: (workspaceId, inputs) => {
        const newTasks: Task[] = inputs.map((input) => ({
          id: crypto.randomUUID(),
          workspaceId,
          title: input.title,
          description: input.description || '',
          status: 'todo',
          priority: input.priority || 'medium',
          categoryId: input.categoryId ?? null,
          timeEstimate: input.timeEstimate ?? null,
          estimatedMinutes: input.estimatedMinutes ?? null,
          dueDate: input.dueDate ?? null,
          timeSpent: 0,
          createdAt: Date.now(),
          completedAt: null,
        }));

        set((state) => ({
          tasksByWorkspace: {
            ...state.tasksByWorkspace,
            [workspaceId]: [...(state.tasksByWorkspace[workspaceId] || []), ...newTasks],
          },
        }));

        return newTasks;
      },

      bulkUpdateTasks: (workspaceId, updates) => {
        set((state) => {
          const tasks = state.tasksByWorkspace[workspaceId] || [];
          const updatedTasks = tasks.map((task) => {
            const update = updates.find((u) => u.id === task.id);
            if (update) {
              return {
                ...task,
                ...update.updates,
                completedAt:
                  update.updates.status === 'done' && task.status !== 'done'
                    ? Date.now()
                    : update.updates.status && update.updates.status !== 'done'
                    ? null
                    : task.completedAt,
              };
            }
            return task;
          });

          return {
            tasksByWorkspace: {
              ...state.tasksByWorkspace,
              [workspaceId]: updatedTasks,
            },
          };
        });
      },
    }),
    {
      name: 'synapse-tasks',
    }
  )
);
