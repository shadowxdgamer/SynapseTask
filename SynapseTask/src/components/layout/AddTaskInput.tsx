import { useState } from 'react';
import { Plus, Sparkles, Wand2, Check, X } from 'lucide-react';
import { Button, Input, Select, Modal } from '../ui';
import { useTaskStore, useWorkspaceStore, useCategoryStore, useSettingsStore } from '../../stores';
import { askAI } from '../../services/openrouter';
import { getMagicAddPrompt, getAutoOrganizePrompt } from '../../utils/prompts';
import { parseAITaskResponse, prepareTasksForAI } from '../../utils/toon';
import type { CreateTaskInput, Task } from '../../types';

interface PendingUpdate {
  id: string;
  original: Task;
  suggested: {
    priority?: Task['priority'];
    categoryId?: string | null;
    estimatedMinutes?: number | null;
  };
}

export function AddTaskInput() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { createTask, bulkCreateTasks, getTasks, bulkUpdateTasks, getTaskById } = useTaskStore();
  const { categories } = useCategoryStore();
  const { apiKey, selectedModelId, customModelId, enableReasoning } = useSettingsStore();

  const [input, setInput] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  
  // AI Preview state
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const effectiveModelId = customModelId || selectedModelId;

  const handleManualAdd = () => {
    if (!input.trim() || !activeWorkspaceId) return;

    createTask(activeWorkspaceId, {
      title: input.trim(),
      categoryId: selectedCategoryId || null,
    });
    setInput('');
  };

  const handleMagicAdd = async () => {
    if (!input.trim() || !activeWorkspaceId || !apiKey) return;

    setIsProcessing(true);
    try {
      const prompt = getMagicAddPrompt(input);
      const response = await askAI(apiKey, effectiveModelId, prompt, {
        enableReasoning,
      });

      const parsedTasks = parseAITaskResponse(response);
      
      if (parsedTasks.length > 0) {
        const tasksToCreate: CreateTaskInput[] = parsedTasks.map((t) => ({
          title: t.title || '',
          description: t.description,
          priority: t.priority,
          categoryId: t.categoryId || selectedCategoryId || null,
          timeEstimate: t.timeEstimate,
        }));

        bulkCreateTasks(activeWorkspaceId, tasksToCreate);
        setInput('');
      }
    } catch (error) {
      console.error('Magic Add error:', error);
      alert(`AI Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoOrganize = async () => {
    if (!activeWorkspaceId || !apiKey) return;

    const tasks = getTasks(activeWorkspaceId);
    if (tasks.length === 0) {
      alert('No tasks to organize!');
      return;
    }

    setIsOrganizing(true);
    try {
      const tasksToon = prepareTasksForAI(tasks);
      const prompt = getAutoOrganizePrompt(tasksToon);
      const response = await askAI(apiKey, effectiveModelId, prompt, {
        enableReasoning,
      });

      const updates = parseAITaskResponse(response);
      
      if (updates.length > 0) {
        // Create pending updates for preview
        const pending: PendingUpdate[] = updates
          .filter((u) => u.id)
          .map((u) => {
            const original = getTaskById(activeWorkspaceId, u.id!);
            // Parse timeEstimate string to minutes if present
            let estimatedMins: number | null = null;
            if (u.timeEstimate) {
              const match = u.timeEstimate.match(/(\d+)/);
              if (match) {
                estimatedMins = parseInt(match[1], 10);
                if (u.timeEstimate.toLowerCase().includes('h')) {
                  estimatedMins *= 60;
                }
              }
            }
            return {
              id: u.id!,
              original: original!,
              suggested: {
                priority: u.priority,
                categoryId: u.categoryId,
                estimatedMinutes: estimatedMins,
              },
            };
          })
          .filter((p) => p.original);

        if (pending.length > 0) {
          setPendingUpdates(pending);
          setShowPreview(true);
        }
      }
    } catch (error) {
      console.error('Auto-Organize error:', error);
      alert(`AI Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleApproveChanges = () => {
    if (!activeWorkspaceId) return;

    const taskUpdates = pendingUpdates.map((p) => ({
      id: p.id,
      updates: {
        priority: p.suggested.priority,
        categoryId: p.suggested.categoryId,
        estimatedMinutes: p.suggested.estimatedMinutes,
      },
    }));

    bulkUpdateTasks(activeWorkspaceId, taskUpdates);
    setShowPreview(false);
    setPendingUpdates([]);
  };

  const handleRejectChanges = () => {
    setShowPreview(false);
    setPendingUpdates([]);
  };

  const getCategoryName = (id: string | null | undefined) => {
    if (!id) return 'None';
    const cat = categories.find((c) => c.id === id);
    return cat ? `${cat.icon} ${cat.name}` : 'None';
  };

  const formatTime = (minutes: number | null | undefined) => {
    if (!minutes) return 'None';
    if (minutes < 60) return `${minutes}min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60 > 0 ? `${minutes % 60}min` : ''}`.trim();
  };

  const categoryOptions = [
    { value: '', label: 'No Category' },
    ...categories.map((c) => ({
      value: c.id,
      label: `${c.icon || ''} ${c.name}`.trim(),
    })),
  ];

  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col gap-3">
          {/* Input row */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleManualAdd()}
              placeholder="Add a task, or ask AI: 'Plan a product launch'..."
              className="flex-1"
            />
            <Select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              options={categoryOptions}
              className="w-40"
            />
          </div>

          {/* Actions row */}
          <div className="flex justify-between items-center">
            {/* Auto-Organize */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAutoOrganize}
              disabled={isOrganizing || !apiKey}
              isLoading={isOrganizing}
              leftIcon={!isOrganizing ? <Wand2 size={16} /> : undefined}
              title={!apiKey ? 'Set API key in settings' : 'AI will suggest categories, priorities, and time estimates'}
            >
              Auto-Organize
            </Button>

            {/* Add buttons */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleManualAdd}
                disabled={!input.trim()}
                leftIcon={<Plus size={16} />}
              >
                Add
              </Button>
              <Button
                size="sm"
                onClick={handleMagicAdd}
                disabled={!input.trim() || isProcessing || !apiKey}
                isLoading={isProcessing}
                leftIcon={!isProcessing ? <Sparkles size={16} /> : undefined}
                title={!apiKey ? 'Set API key in settings' : 'AI will create tasks from your input'}
              >
                Magic Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={handleRejectChanges}
        title="Review AI Suggestions"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The AI has suggested the following changes to your tasks. Review and approve or reject.
          </p>

          <div className="max-h-96 overflow-y-auto space-y-3 custom-scrollbar">
            {pendingUpdates.map((update) => (
              <div
                key={update.id}
                className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
                  {update.original.title}
                </h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {/* Priority */}
                  {update.suggested.priority && update.suggested.priority !== update.original.priority && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Priority:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 dark:text-slate-300">{update.original.priority}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">{update.suggested.priority}</span>
                      </div>
                    </div>
                  )}
                  {/* Category */}
                  {update.suggested.categoryId !== undefined && update.suggested.categoryId !== update.original.categoryId && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Category:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 dark:text-slate-300">{getCategoryName(update.original.categoryId)}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">{getCategoryName(update.suggested.categoryId)}</span>
                      </div>
                    </div>
                  )}
                  {/* Time */}
                  {update.suggested.estimatedMinutes && update.suggested.estimatedMinutes !== update.original.estimatedMinutes && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Time:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 dark:text-slate-300">{formatTime(update.original.estimatedMinutes)}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">{formatTime(update.suggested.estimatedMinutes)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="ghost" onClick={handleRejectChanges} leftIcon={<X size={16} />}>
              Reject All
            </Button>
            <Button onClick={handleApproveChanges} leftIcon={<Check size={16} />}>
              Approve All
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
