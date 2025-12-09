import { useState, useEffect } from 'react';
import { Key, Cpu, Check, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { Modal, Input, Button } from '../ui';
import { useSettingsStore, useModelCacheStore } from '../../stores';
import { fetchModels, validateApiKey } from '../../services/openrouter';
import type { OpenRouterModel } from '../../types';
import { RECOMMENDED_MODELS } from '../../types/model';
import { ModelAutocomplete } from './ModelAutocomplete';

export function SettingsModal() {
  const {
    apiKey,
    selectedModelId,
    customModelId,
    enableReasoning,
    settingsOpen: isOpen,
    setApiKey,
    setSelectedModel,
    setCustomModel,
    setEnableReasoning,
    setSettingsOpen,
  } = useSettingsStore();
  
  const {
    models: cachedModels,
    isLoading: isLoadingModels,
    lastFetched,
    shouldRefetch,
    setModels: setCachedModels,
    setLoading: setLoadingModels,
    setError: setModelsError,
    clearCache,
  } = useModelCacheStore();
  
  const onClose = () => setSettingsOpen(false);

  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localCustomModel, setLocalCustomModel] = useState(customModelId || '');
  const [isValidating, setIsValidating] = useState(false);
  const [keyValid, setKeyValid] = useState<boolean | null>(null);

  // Filter models to text-only
  const textModels = cachedModels
    .filter((m) => m.architecture?.output_modalities?.includes('text'))
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (isOpen) {
      setLocalApiKey(apiKey);
      setLocalCustomModel(customModelId || '');
      // Only fetch if cache is stale or empty
      if (shouldRefetch()) {
        loadModels();
      }
    }
  }, [isOpen, apiKey, customModelId]);

  const loadModels = async (forceRefresh = false) => {
    if (!forceRefresh && !shouldRefetch()) return;
    
    setLoadingModels(true);
    try {
      const fetchedModels = await fetchModels();
      setCachedModels(fetchedModels);
    } catch (error) {
      console.error('Failed to load models:', error);
      setModelsError('Failed to load models');
    }
  };

  const handleRefreshModels = () => {
    clearCache();
    loadModels(true);
  };

  const handleValidateKey = async () => {
    if (!localApiKey.trim()) return;
    setIsValidating(true);
    setKeyValid(null);
    try {
      const valid = await validateApiKey(localApiKey);
      setKeyValid(valid);
    } catch {
      setKeyValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    setApiKey(localApiKey);
    setCustomModel(localCustomModel.trim() || null);
    onClose();
  };

  // Format time ago for cache display
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="lg">
      <div className="space-y-6">
        {/* API Key Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Key size={18} />
            OpenRouter API Key
          </h3>
          <div className="flex gap-2">
            <Input
              type="password"
              value={localApiKey}
              onChange={(e) => {
                setLocalApiKey(e.target.value);
                setKeyValid(null);
              }}
              placeholder="sk-or-v1-..."
              className="flex-1"
            />
            <Button
              variant="secondary"
              onClick={handleValidateKey}
              disabled={!localApiKey.trim() || isValidating}
              isLoading={isValidating}
            >
              {keyValid === true ? <Check size={16} className="text-green-500" /> : 'Validate'}
            </Button>
          </div>
          {keyValid === false && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} />
              Invalid API key
            </p>
          )}
          {keyValid === true && (
            <p className="text-xs text-green-500 flex items-center gap-1">
              <Check size={12} />
              API key is valid
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Get your API key from{' '}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              openrouter.ai/keys <ExternalLink size={10} />
            </a>
            . Your key is stored locally and never sent to our servers.
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Cpu size={18} />
              AI Model
            </h3>
            <button
              onClick={handleRefreshModels}
              disabled={isLoadingModels}
              className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
              title="Refresh model list"
            >
              <RefreshCw size={12} className={isLoadingModels ? 'animate-spin' : ''} />
              {lastFetched ? `Cached ${formatTimeAgo(lastFetched)}` : 'Refresh'}
            </button>
          </div>
          
          <ModelAutocomplete
            models={textModels}
            selectedModelId={selectedModelId}
            onSelect={setSelectedModel}
            isLoading={isLoadingModels}
            placeholder="Type to search models..."
          />

          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Quick select:</span>{' '}
            <button
              onClick={() => setSelectedModel(RECOMMENDED_MODELS.default)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              DeepSeek V3.2
            </button>
            {' · '}
            <button
              onClick={() => setSelectedModel(RECOMMENDED_MODELS.free)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Llama 3 (Free)
            </button>
          </div>

          <Input
            label="Or enter custom model ID"
            value={localCustomModel}
            onChange={(e) => setLocalCustomModel(e.target.value)}
            placeholder="e.g., anthropic/claude-3-opus"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Custom model overrides the selection above. Leave empty to use selected model.
          </p>
        </div>

        {/* Reasoning Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">Enable Reasoning</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For models that support extended thinking (DeepSeek V3.2, etc.)
            </p>
          </div>
          <button
            onClick={() => setEnableReasoning(!enableReasoning)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              enableReasoning ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                enableReasoning ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </Modal>
  );
}
