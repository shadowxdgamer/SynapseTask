import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { TaskEditModal } from './TaskEditModal';
import { useTaskStore, useWorkspaceStore } from '../../stores';
import type { Task, TaskStatus } from '../../types';

const columns: { id: TaskStatus; title: string; icon: typeof Circle; color: string }[] = [
  { id: 'todo', title: 'To Do', icon: Circle, color: 'text-slate-600 dark:text-slate-400' },
  { id: 'inprogress', title: 'In Progress', icon: Clock, color: 'text-blue-600 dark:text-blue-400' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'text-green-600 dark:text-green-400' },
];

export function KanbanBoard() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { getTasksByStatus, moveTask, deleteTask, getTaskById } = useTaskStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (!activeWorkspaceId) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No workspace selected
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = getTaskById(activeWorkspaceId, active.id as string);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're over a column directly
    const overColumn = columns.find((c) => c.id === overId);
    if (overColumn) {
      const task = getTaskById(activeWorkspaceId, activeId);
      if (task && task.status !== overColumn.id) {
        moveTask(activeWorkspaceId, activeId, overColumn.id);
      }
      return;
    }
    
    // Check if we're over another task - get that task's column
    const overTask = getTaskById(activeWorkspaceId, overId);
    if (overTask) {
      const activeTask = getTaskById(activeWorkspaceId, activeId);
      if (activeTask && activeTask.status !== overTask.status) {
        moveTask(activeWorkspaceId, activeId, overTask.status);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropped on a column, update status
    const overColumn = columns.find((c) => c.id === overId);
    if (overColumn) {
      moveTask(activeWorkspaceId, activeId, overColumn.id);
      return;
    }
    
    // If dropped on a task, move to that task's column
    const overTask = getTaskById(activeWorkspaceId, overId);
    if (overTask) {
      moveTask(activeWorkspaceId, activeId, overTask.status);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(activeWorkspaceId, taskId);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full overflow-x-auto pb-2">
          {columns.map((column) => (
            <Column
              key={column.id}
              title={column.title}
              status={column.id}
              tasks={getTasksByStatus(activeWorkspaceId, column.id)}
              icon={column.icon}
              color={column.color}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 scale-105">
              <TaskCard
                task={activeTask}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit Task Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
      />
    </>
  );
}
