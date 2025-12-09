import { useState } from 'react';
import { Plus, MoreHorizontal, Trash2, Edit2, ChevronLeft, FolderOpen } from 'lucide-react';
import { useWorkspaceStore, useSettingsStore } from '../../stores';
import { Button, Input } from '../ui';

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useSettingsStore();
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  } = useWorkspaceStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleCreate = () => {
    if (newWorkspaceName.trim()) {
      createWorkspace({ name: newWorkspaceName.trim() });
      setNewWorkspaceName('');
      setIsCreating(false);
    }
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
    setMenuOpenId(null);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateWorkspace(id, { name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id: string) => {
    if (workspaces.length > 1) {
      deleteWorkspace(id);
    }
    setMenuOpenId(null);
  };

  const sortedWorkspaces = [...workspaces].sort((a, b) => a.order - b.order);

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <FolderOpen size={18} className="text-indigo-500" />
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Workspaces</h2>
        </div>
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Workspace List */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <div className="space-y-1">
          {sortedWorkspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`
                group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                transition-colors
                ${
                  activeWorkspaceId === workspace.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }
              `}
              onClick={() => setActiveWorkspace(workspace.id)}
            >
              <span className="text-lg">{workspace.icon}</span>

              {editingId === workspace.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleSaveEdit(workspace.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(workspace.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-white dark:bg-slate-600 border border-indigo-500 rounded px-2 py-0.5 text-sm focus:outline-none"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm font-medium truncate">
                  {workspace.name}
                </span>
              )}

              {/* Menu button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === workspace.id ? null : workspace.id);
                }}
                className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-opacity"
              >
                <MoreHorizontal size={16} />
              </button>

              {/* Dropdown menu */}
              {menuOpenId === workspace.id && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(workspace.id, workspace.name);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                  >
                    <Edit2 size={14} />
                    Rename
                  </button>
                  {workspaces.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(workspace.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Create new workspace */}
        {isCreating ? (
          <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <Input
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Workspace name..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleCreate}>
                Create
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Plus size={16} />
            New Workspace
          </button>
        )}
      </div>
    </aside>
  );
}
