export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryId: string | null;
  timeEstimate: string | null;
  estimatedMinutes: number | null;
  dueDate: string | null;
  timeSpent: number; // in minutes
  createdAt: number;
  completedAt: number | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  categoryId?: string | null;
  timeEstimate?: string | null;
  estimatedMinutes?: number | null;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string | null;
  timeEstimate?: string | null;
  estimatedMinutes?: number | null;
  dueDate?: string | null;
  timeSpent?: number;
}
