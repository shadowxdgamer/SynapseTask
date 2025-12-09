import { useState, useEffect } from 'react';
import { Key, Cpu, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { Modal, Input, Button, Select } from '../ui';
import { useSettingsStore } from '../../stores';
import { fetchModels, validateApiKey } from '../../services/openrouter';
import type { OpenRouterModel } from '../../types';
import { formatModelPrice, RECOMMENDED_MODELS } from '../../types/model';

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
  
  const onClose = () => setSettingsOpen(false);

  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localCustomModel, setLocalCustomModel] = useState(customModelId || '');
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [keyValid, setKeyValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalApiKey(apiKey);
      setLocalCustomModel(customModelId || '');
      loadModels();
    }
  }, [isOpen, apiKey, customModelId]);

  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const fetchedModels = await fetchModels();
      // Filter to text models only and sort by name
      const textModels = fetchedModels
        .filter((m) => m.architecture?.output_modalities?.includes('text'))
        .sort((a, b) => a.name.localeCompare(b.name));
      setModels(textModels);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setIsLoadingModels(false);
    }
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

  const modelOptions = [
    { value: '', label: isLoadingModels ? 'Loading models...' : 'Select a model' },
    ...models.slice(0, 50).map((m) => ({
      value: m.id,
      label: `${m.name} (${formatModelPrice(m.pricing.prompt)})`,
    })),
  ];

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
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Cpu size={18} />
            AI Model
          </h3>
          
          <Select
            label="Select from list"
            value={selectedModelId}
            onChange={(e) => setSelectedModel(e.target.value)}
            options={modelOptions}
            disabled={isLoadingModels}
          />

          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Recommended:</span>{' '}
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
