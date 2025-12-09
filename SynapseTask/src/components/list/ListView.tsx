import { useState } from 'react';
import { 
  Circle, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight,
  Trash2,
  Calendar
} from 'lucide-react';
import { useTaskStore, useWorkspaceStore, useCategoryStore } from '../../stores';
import { TaskEditModal } from '../board/TaskEditModal';
import type { Task, TaskStatus, TaskPriority } from '../../types';

const statusConfig: Record<TaskStatus, { label: string; icon: typeof Circle; color: string }> = {
  todo: { label: 'To Do', icon: Circle, color: 'text-slate-500' },
  inprogress: { label: 'In Progress', icon: Clock, color: 'text-blue-500' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-green-500' },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-slate-500 bg-slate-100 dark:bg-slate-700' },
  medium: { label: 'Medium', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  high: { label: 'High', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
  urgent: { label: 'Urgent', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
};

export function ListView() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { getTasks, deleteTask, updateTask } = useTaskStore();
  const { getCategoryById } = useCategoryStore();
  
  const [collapsedSections, setCollapsedSections] = useState<Set<TaskStatus>>(new Set());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!activeWorkspaceId) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No workspace selected
      </div>
    );
  }

  const tasks = getTasks(activeWorkspaceId);
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    inprogress: tasks.filter(t => t.status === 'inprogress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  const toggleSection = (status: TaskStatus) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const toggleTaskStatus = (task: Task) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      todo: 'inprogress',
      inprogress: 'done',
      done: 'todo',
    };
    updateTask(activeWorkspaceId, task.id, { status: nextStatus[task.status] });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (minutes: number | null | undefined) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h${minutes % 60 > 0 ? ` ${minutes % 60}m` : ''}`;
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-4">
        {(Object.entries(tasksByStatus) as [TaskStatus, Task[]][]).map(([status, statusTasks]) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const isCollapsed = collapsedSections.has(status);

          return (
            <div key={status} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(status)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                  <Icon size={18} className={config.color} />
                  <span className="font-medium text-slate-800 dark:text-slate-100">{config.label}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">({statusTasks.length})</span>
                </div>
              </button>

              {/* Tasks */}
              {!isCollapsed && (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {statusTasks.length === 0 ? (
                    <div className="px-4 py-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                      No tasks
                    </div>
                  ) : (
                    statusTasks.map(task => {
                      const category = task.categoryId ? getCategoryById(task.categoryId) : null;
                      const priorityCfg = priorityConfig[task.priority];

                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 group transition-colors"
                        >
                          {/* Status toggle */}
                          <button
                            onClick={() => toggleTaskStatus(task)}
                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors ${
                              task.status === 'done'
                                ? 'bg-green-500 border-green-500 text-white'
                                : task.status === 'inprogress'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                            }`}
                          >
                            {task.status === 'done' && <CheckCircle2 size={16} className="m-auto" />}
                          </button>

                          {/* Task content */}
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => handleEdit(task)}
                              className={`text-left w-full font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                                task.status === 'done'
                                  ? 'text-slate-400 dark:text-slate-500 line-through'
                                  : 'text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {task.title}
                            </button>
                            {task.description && (
                              <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Priority */}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityCfg.color}`}>
                              {priorityCfg.label}
                            </span>

                            {/* Category */}
                            {category && (
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{ backgroundColor: category.color + '20', color: category.color }}
                              >
                                {category.icon} {category.name}
                              </span>
                            )}

                            {/* Time estimate */}
                            {task.estimatedMinutes && (
                              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <Clock size={12} />
                                {formatTime(task.estimatedMinutes)}
                              </span>
                            )}

                            {/* Due date */}
                            {task.dueDate && (
                              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <Calendar size={12} />
                                {formatDate(task.dueDate)}
                              </span>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => deleteTask(activeWorkspaceId, task.id)}
                              className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <TaskEditModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
      />
    </>
  );
}
