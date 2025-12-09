import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import type { LucideIcon } from 'lucide-react';

interface ColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  icon: LucideIcon;
  color: string;
  onDeleteTask: (id: string) => void;
  onEditTask?: (task: Task) => void;
}

export function Column({
  title,
  status,
  tasks,
  icon: Icon,
  color,
  onDeleteTask,
  onEditTask,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  // Sort tasks by priority (urgent -> high -> medium -> low)
  const priorityOrder: Record<Task['priority'], number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sortedTasks = [...tasks].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 min-w-[300px] 
        bg-slate-50 dark:bg-slate-800/50 
        rounded-xl p-4 
        flex flex-col h-full 
        border border-slate-200/60 dark:border-slate-700/60
        transition-all duration-200
        ${isOver ? 'ring-2 ring-indigo-500 ring-dashed bg-indigo-50/50 dark:bg-indigo-900/20' : ''}
      `}
    >
      {/* Column Header */}
      <div className={`flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 ${color}`}>
        <Icon size={20} />
        <h3 className="font-bold text-slate-700 dark:text-slate-200">{title}</h3>
        <span className="ml-auto bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-full border border-slate-200 dark:border-slate-600">
          {tasks.length}
        </span>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
        <SortableContext items={sortedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {sortedTasks.length === 0 ? (
            <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm italic">
              Drop tasks here
            </div>
          ) : (
            sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
