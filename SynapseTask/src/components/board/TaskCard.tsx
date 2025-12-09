import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, Clock, ArrowUpCircle, ArrowRightCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import type { Task, TaskPriority } from '../../types';
import { Badge } from '../ui';
import { useCategoryStore } from '../../stores';
import { getCategoryColorClasses } from '../../types/category';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
}

const priorityConfig: Record<TaskPriority, { icon: typeof ArrowUpCircle; styles: string; label: string }> = {
  urgent: {
    icon: AlertCircle,
    styles: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    label: 'URGENT',
  },
  high: {
    icon: ArrowUpCircle,
    styles: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    label: 'HIGH',
  },
  medium: {
    icon: ArrowRightCircle,
    styles: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    label: 'MED',
  },
  low: {
    icon: ArrowDownCircle,
    styles: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    label: 'LOW',
  },
};

export function TaskCard({ task, onDelete, onEdit }: TaskCardProps) {
  const { getCategoryById } = useCategoryStore();
  const category = task.categoryId ? getCategoryById(task.categoryId) : null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityInfo = priorityConfig[task.priority];
  const PriorityIcon = priorityInfo.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white dark:bg-slate-800 
        p-3 rounded-lg shadow-sm 
        border border-slate-200 dark:border-slate-700
        group relative
        transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5
        ${isDragging ? 'opacity-50 shadow-xl scale-105 rotate-2 z-50' : ''}
      `}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <GripVertical size={14} />
      </div>

      {/* Content */}
      <div className="pl-5">
        {/* Top row: Priority + Category + Delete */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-wrap gap-1">
            {/* Priority Badge */}
            <Badge
              variant="custom"
              size="sm"
              className={priorityInfo.styles}
              icon={<PriorityIcon size={10} />}
            >
              {priorityInfo.label}
            </Badge>

            {/* Category Badge */}
            {category && (
              <Badge
                variant="custom"
                size="sm"
                className={getCategoryColorClasses(category.color)}
              >
                {category.icon} {category.name}
              </Badge>
            )}
          </div>

          {/* Delete button */}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Title */}
        <h4
          onClick={() => onEdit?.(task)}
          className="font-medium text-slate-800 dark:text-slate-100 text-sm leading-snug mb-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
            {task.description}
          </p>
        )}

        {/* Footer: Time estimate */}
        {task.timeEstimate && (
          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <Clock size={12} />
            <span>{task.timeEstimate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
