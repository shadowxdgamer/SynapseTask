import { useState, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Circle, CheckCircle2, Clock as ClockIcon } from 'lucide-react';
import { useTaskStore, useWorkspaceStore, useCategoryStore } from '../../stores';
import { TaskEditModal } from '../board/TaskEditModal';
import type { Task, TaskStatus, TaskPriority } from '../../types';

interface NodePosition {
  x: number;
  y: number;
}

const statusConfig: Record<TaskStatus, { color: string; bgColor: string; label: string }> = {
  todo: { color: '#64748b', bgColor: '#f1f5f9', label: 'To Do' },
  inprogress: { color: '#3b82f6', bgColor: '#dbeafe', label: 'In Progress' },
  done: { color: '#22c55e', bgColor: '#dcfce7', label: 'Done' },
};

const priorityConfig: Record<TaskPriority, { color: string }> = {
  urgent: { color: '#a855f7' },
  high: { color: '#ef4444' },
  medium: { color: '#f59e0b' },
  low: { color: '#6b7280' },
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
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  const tasks = useMemo(() => {
    if (!activeWorkspaceId) return [];
    return getTasks(activeWorkspaceId);
  }, [activeWorkspaceId, getTasks]);

  // Group tasks by status for mind map layout
  const tasksByStatus = useMemo(() => {
    return {
      todo: tasks.filter(t => t.status === 'todo'),
      inprogress: tasks.filter(t => t.status === 'inprogress'),
      done: tasks.filter(t => t.status === 'done'),
    };
  }, [tasks]);

  // Calculate node positions - status-centric layout optimized for many tasks
  const { positions, connections } = useMemo(() => {
    const centerX = 900;
    const centerY = 700;
    
    // Calculate total tasks to determine layout strategy
    const totalTasks = tasks.length;
    const maxTasksPerStatus = Math.max(
      tasksByStatus.todo.length,
      tasksByStatus.inprogress.length,
      tasksByStatus.done.length
    );
    
    // Dynamic spacing based on task count - increased for more spacing
    const statusRadius = Math.max(280, Math.min(400, 260 + maxTasksPerStatus * 5));
    
    // Status hub positions: Done at top, Todo bottom-left, In Progress bottom-right
    const statusAngles: Record<TaskStatus, number> = {
      done: -Math.PI / 2,              // Top (12 o'clock)
      todo: Math.PI / 2 + Math.PI / 3, // Bottom-left (7 o'clock)
      inprogress: Math.PI / 2 - Math.PI / 3, // Bottom-right (5 o'clock)
    };

    const pos: Map<string, NodePosition> = new Map();
    const conn: { from: NodePosition; to: NodePosition; color: string }[] = [];
    
    pos.set('center', { x: centerX, y: centerY });

    (['todo', 'inprogress', 'done'] as TaskStatus[]).forEach((status) => {
      const angle = statusAngles[status];
      const x = centerX + Math.cos(angle) * statusRadius;
      const y = centerY + Math.sin(angle) * statusRadius;
      pos.set(`status-${status}`, { x, y });
      
      conn.push({
        from: { x: centerX, y: centerY },
        to: { x, y },
        color: statusConfig[status].color,
      });

      const statusTasks = tasksByStatus[status];
      const taskCount = statusTasks.length;
      
      if (taskCount === 0) return;

      // For many tasks, use multiple rings with more spacing
      const maxTasksPerRing = 10;
      const ringCount = Math.ceil(taskCount / maxTasksPerRing);
      const baseRadius = 120; // Increased base radius for more spacing from status hub
      const ringSpacing = 90; // Increased ring spacing
      
      statusTasks.forEach((task, i) => {
        // Determine which ring this task belongs to
        const ringIndex = Math.floor(i / maxTasksPerRing);
        const positionInRing = i % maxTasksPerRing;
        const tasksInThisRing = Math.min(maxTasksPerRing, taskCount - ringIndex * maxTasksPerRing);
        
        // Calculate radius for this ring
        const taskRadius = baseRadius + ringIndex * ringSpacing;
        
        // Calculate angle spread - wider spread for better spacing
        const spreadAngle = tasksInThisRing > 5 ? Math.PI * 1.8 : Math.PI * 1.2;
        const startAngle = angle - spreadAngle / 2;
        
        let taskAngle: number;
        if (tasksInThisRing === 1) {
          taskAngle = angle;
        } else {
          taskAngle = startAngle + (positionInRing / (tasksInThisRing - 1)) * spreadAngle;
        }
        
        // Add slight offset for outer rings to avoid alignment
        if (ringIndex > 0) {
          taskAngle += (spreadAngle / tasksInThisRing) / 2;
        }
        
        const taskX = x + Math.cos(taskAngle) * taskRadius;
        const taskY = y + Math.sin(taskAngle) * taskRadius;
        pos.set(`task-${task.id}`, { x: taskX, y: taskY });
        
        conn.push({
          from: { x, y },
          to: { x: taskX, y: taskY },
          color: priorityConfig[task.priority].color,
        });
      });
    });

    return { positions: pos, connections: conn };
  }, [tasksByStatus]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.node-interactive')) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
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
    setZoom(prev => Math.max(0.2, Math.min(5, prev * delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h`;
  };

  if (!activeWorkspaceId) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No workspace selected
      </div>
    );
  }

  const centerPos = positions.get('center')!;

  return (
    <>
      <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl">
        {/* Controls */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(5, prev * 1.2))}
            className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105"
          >
            <ZoomIn size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.2, prev * 0.8))}
            className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105"
          >
            <ZoomOut size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={resetView}
            className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105"
          >
            <RotateCcw size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg p-4">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-3">Legend</div>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              {(['todo', 'inprogress', 'done'] as TaskStatus[]).map(status => (
                <div key={status} className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: statusConfig[status].color }}
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{statusConfig[status].label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map(priority => (
                <div key={priority} className="flex items-center gap-1.5">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: priorityConfig[priority].color }}
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-500 capitalize">{priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mind Map Canvas */}
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1800 1400"
            preserveAspectRatio="xMidYMid meet"
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              userSelect: 'none',
            }}
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-700" opacity="0.5" />
              </pattern>
              <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Connection lines */}
            {connections.map((conn, i) => (
              <g key={i}>
                <line
                  x1={conn.from.x}
                  y1={conn.from.y}
                  x2={conn.to.x}
                  y2={conn.to.y}
                  stroke={conn.color}
                  strokeWidth="2"
                  opacity="0.4"
                  strokeLinecap="round"
                />
                <circle r="3" fill={conn.color} opacity="0.6">
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path={`M${conn.from.x},${conn.from.y} L${conn.to.x},${conn.to.y}`}
                  />
                </circle>
              </g>
            ))}

            {/* Center node */}
            <g transform={`translate(${centerPos.x}, ${centerPos.y})`} className="node-interactive">
              <circle r="55" fill="url(#centerGradient)" filter="url(#glow)" />
              <circle r="50" fill="url(#centerGradient)" />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                y="-8"
                fill="white"
                fontWeight="bold"
                fontSize="16"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                🧠 Tasks
              </text>
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                y="12"
                fill="rgba(255,255,255,0.8)"
                fontSize="12"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {tasks.length} total
              </text>
            </g>

            {/* Status nodes */}
            {(['todo', 'inprogress', 'done'] as TaskStatus[]).map(status => {
              const pos = positions.get(`status-${status}`);
              if (!pos) return null;
              const config = statusConfig[status];
              const count = tasksByStatus[status].length;

              return (
                <g key={status} transform={`translate(${pos.x}, ${pos.y})`} className="node-interactive">
                  <circle r="48" fill={config.color} opacity="0.15" />
                  <circle r="42" fill={config.bgColor} stroke={config.color} strokeWidth="3" />
                  
                  {status === 'done' && (
                    <g transform="translate(-10, -18)">
                      <CheckCircle2 width={20} height={20} color={config.color} />
                    </g>
                  )}
                  {status === 'inprogress' && (
                    <g transform="translate(-10, -18)">
                      <ClockIcon width={20} height={20} color={config.color} />
                    </g>
                  )}
                  {status === 'todo' && (
                    <g transform="translate(-10, -18)">
                      <Circle width={20} height={20} color={config.color} />
                    </g>
                  )}
                  
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    y="8"
                    fontSize="11"
                    fontWeight="600"
                    fill={config.color}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {config.label}
                  </text>
                  
                  <circle cx="28" cy="-28" r="14" fill={config.color} />
                  <text
                    x="28"
                    y="-28"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontWeight="bold"
                    fontSize="11"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {count}
                  </text>
                </g>
              );
            })}

            {/* Task nodes */}
            {tasks.map(task => {
              const pos = positions.get(`task-${task.id}`);
              if (!pos) return null;
              const statusCfg = statusConfig[task.status];
              const priorityCfg = priorityConfig[task.priority];
              const category = task.categoryId ? getCategoryById(task.categoryId) : null;
              const isHovered = hoveredTask === task.id;
              
              // Dynamic node size based on total task count
              const baseNodeSize = tasks.length > 30 ? 22 : tasks.length > 15 ? 26 : 32;
              const nodeRadius = isHovered ? baseNodeSize + 6 : baseNodeSize;
              const fontSize = tasks.length > 30 ? 7 : tasks.length > 15 ? 8 : 9;
              const maxTitleLength = tasks.length > 30 ? 8 : tasks.length > 15 ? 10 : 12;

              return (
                <g 
                  key={task.id} 
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="node-interactive cursor-pointer"
                  onClick={() => handleTaskClick(task)}
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  {(task.priority === 'urgent' || task.priority === 'high') && (
                    <circle 
                      r={nodeRadius + 6} 
                      fill={priorityCfg.color} 
                      opacity="0.2"
                    >
                      <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  
                  <circle
                    r={nodeRadius}
                    fill="white"
                    stroke={statusCfg.color}
                    strokeWidth={isHovered ? 3 : 2}
                    className="dark:fill-slate-800"
                  />
                  
                  <circle
                    cx={nodeRadius - 4}
                    cy={-nodeRadius + 4}
                    r={tasks.length > 30 ? 4 : 5}
                    fill={priorityCfg.color}
                  />
                  
                  {task.status === 'done' && (
                    <>
                      <circle cx={-nodeRadius + 4} cy={-nodeRadius + 4} r={tasks.length > 30 ? 5 : 6} fill="#22c55e" />
                      <text
                        x={-nodeRadius + 4}
                        y={-nodeRadius + 5}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize={tasks.length > 30 ? 7 : 8}
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        ✓
                      </text>
                    </>
                  )}

                  {category && tasks.length <= 30 && (
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      y="-6"
                      fontSize={tasks.length > 15 ? 10 : 12}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {category.icon}
                    </text>
                  )}
                  
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    y={category && tasks.length <= 30 ? 5 : 0}
                    fontSize={fontSize}
                    fontWeight="500"
                    className="dark:fill-slate-100"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {task.title.length > maxTitleLength ? task.title.slice(0, maxTitleLength) + '...' : task.title}
                  </text>
                  
                  {task.estimatedMinutes && tasks.length <= 30 && (
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      y={category ? 15 : 12}
                      fontSize="7"
                      fill="#94a3b8"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      ⏱ {formatTime(task.estimatedMinutes)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
              <div className="text-5xl mb-4">🧠</div>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">No tasks yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Add some tasks to see them visualized here</p>
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
