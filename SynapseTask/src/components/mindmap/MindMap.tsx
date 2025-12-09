import { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Circle, CheckCircle2 } from 'lucide-react';
import { useTaskStore, useWorkspaceStore, useCategoryStore } from '../../stores';
import { TaskEditModal } from '../board/TaskEditModal';
import type { Task, TaskStatus } from '../../types';

interface NodePosition {
  x: number;
  y: number;
}

const statusColors: Record<TaskStatus, string> = {
  todo: '#64748b',
  inprogress: '#3b82f6',
  done: '#22c55e',
};

const priorityRadius: Record<string, number> = {
  urgent: 45,
  high: 40,
  medium: 35,
  low: 30,
};

export function MindMap() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { getTasks } = useTaskStore();
  const { getCategoryById } = useCategoryStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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

  // Group tasks by category
  const tasksByCategory = tasks.reduce((acc, task) => {
    const key = task.categoryId || 'uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const categoryKeys = Object.keys(tasksByCategory);

  // Calculate node positions in a radial layout
  const calculatePositions = useCallback(() => {
    const centerX = 400;
    const centerY = 300;
    const categoryRadius = 180;
    const taskRadius = 80;

    const positions: Map<string, NodePosition> = new Map();
    
    // Position categories in a circle around the center
    categoryKeys.forEach((catKey, catIndex) => {
      const catAngle = (catIndex / categoryKeys.length) * 2 * Math.PI - Math.PI / 2;
      const catX = centerX + Math.cos(catAngle) * categoryRadius;
      const catY = centerY + Math.sin(catAngle) * categoryRadius;
      
      positions.set(`cat-${catKey}`, { x: catX, y: catY });

      // Position tasks around their category
      const catTasks = tasksByCategory[catKey];
      catTasks.forEach((task, taskIndex) => {
        const taskAngle = catAngle + ((taskIndex - (catTasks.length - 1) / 2) * 0.4);
        const taskX = catX + Math.cos(taskAngle) * taskRadius;
        const taskY = catY + Math.sin(taskAngle) * taskRadius;
        
        positions.set(`task-${task.id}`, { x: taskX, y: taskY });
      });
    });

    return positions;
  }, [categoryKeys, tasksByCategory]);

  const positions = calculatePositions();

  // Pan and zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('mindmap-bg')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(2, prev * delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-xl">
        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(2, prev * 1.2))}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ZoomIn size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.3, prev * 0.8))}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ZoomOut size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={resetView}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-md p-3">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">Status</div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <Circle size={12} fill="#64748b" stroke="none" />
              <span className="text-xs text-slate-500 dark:text-slate-400">To Do</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Circle size={12} fill="#3b82f6" stroke="none" />
              <span className="text-xs text-slate-500 dark:text-slate-400">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Circle size={12} fill="#22c55e" stroke="none" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Done</span>
            </div>
          </div>
        </div>

        {/* Mind Map Canvas */}
        <div
          ref={containerRef}
          className="mindmap-bg w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <svg
            width="100%"
            height="100%"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Center node */}
            <g transform="translate(400, 300)">
              <circle r="50" fill="url(#centerGradient)" />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white font-bold text-sm"
              >
                Tasks
              </text>
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                y="16"
                className="fill-white/70 text-xs"
              >
                {tasks.length} total
              </text>
            </g>

            {/* Lines from center to categories */}
            {categoryKeys.map(catKey => {
              const catPos = positions.get(`cat-${catKey}`);
              if (!catPos) return null;
              return (
                <line
                  key={`line-center-${catKey}`}
                  x1={400}
                  y1={300}
                  x2={catPos.x}
                  y2={catPos.y}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
              );
            })}

            {/* Category nodes and their task connections */}
            {categoryKeys.map(catKey => {
              const catPos = positions.get(`cat-${catKey}`);
              if (!catPos) return null;
              
              const category = catKey !== 'uncategorized' ? getCategoryById(catKey) : null;
              const catTasks = tasksByCategory[catKey];

              return (
                <g key={`cat-${catKey}`}>
                  {/* Lines from category to tasks */}
                  {catTasks.map(task => {
                    const taskPos = positions.get(`task-${task.id}`);
                    if (!taskPos) return null;
                    return (
                      <line
                        key={`line-${catKey}-${task.id}`}
                        x1={catPos.x}
                        y1={catPos.y}
                        x2={taskPos.x}
                        y2={taskPos.y}
                        stroke={statusColors[task.status]}
                        strokeWidth="1.5"
                        opacity="0.6"
                      />
                    );
                  })}

                  {/* Category node */}
                  <g transform={`translate(${catPos.x}, ${catPos.y})`}>
                    <circle
                      r="35"
                      fill={category?.color || '#6366f1'}
                      opacity="0.9"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white font-medium"
                      style={{ fontSize: '11px' }}
                    >
                      {category ? `${category.icon}` : '📋'}
                    </text>
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      y="16"
                      className="fill-white/80"
                      style={{ fontSize: '9px' }}
                    >
                      {category?.name || 'Uncategorized'}
                    </text>
                  </g>

                  {/* Task nodes */}
                  {catTasks.map(task => {
                    const taskPos = positions.get(`task-${task.id}`);
                    if (!taskPos) return null;
                    const radius = priorityRadius[task.priority] || 30;
                    
                    return (
                      <g
                        key={`task-${task.id}`}
                        transform={`translate(${taskPos.x}, ${taskPos.y})`}
                        className="cursor-pointer"
                        onClick={() => handleTaskClick(task)}
                      >
                        <circle
                          r={radius}
                          fill={statusColors[task.status]}
                          opacity="0.85"
                          className="hover:opacity-100 transition-opacity"
                        />
                        {task.status === 'done' && (
                          <CheckCircle2 
                            size={14} 
                            className="fill-none stroke-white" 
                            style={{ transform: 'translate(-7px, -20px)' }}
                          />
                        )}
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-white"
                          style={{ fontSize: '9px', fontWeight: 500 }}
                        >
                          {task.title.length > 12 ? task.title.slice(0, 12) + '...' : task.title}
                        </text>
                        {task.estimatedMinutes && (
                          <text
                            textAnchor="middle"
                            dominantBaseline="middle"
                            y="12"
                            className="fill-white/70"
                            style={{ fontSize: '8px' }}
                          >
                            {task.estimatedMinutes < 60 ? `${task.estimatedMinutes}m` : `${Math.floor(task.estimatedMinutes / 60)}h`}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-slate-500 dark:text-slate-400 mb-2">🧠 No tasks yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Add some tasks to see them visualized here</p>
            </div>
          </div>
        )}
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
