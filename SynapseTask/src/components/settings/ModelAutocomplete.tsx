import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Loader2, Sparkles, X } from 'lucide-react';
import type { OpenRouterModel } from '../../types';
import { formatModelPrice, RECOMMENDED_MODELS } from '../../types/model';

interface ModelAutocompleteProps {
  models: OpenRouterModel[];
  selectedModelId: string;
  onSelect: (modelId: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ModelAutocomplete({
  models,
  selectedModelId,
  onSelect,
  isLoading = false,
  placeholder = 'Type to search models...',
}: ModelAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Get the selected model's name for display
  const selectedModel = useMemo(
    () => models.find((m) => m.id === selectedModelId),
    [models, selectedModelId]
  );

  // Filter models based on query
  const filteredModels = useMemo(() => {
    if (!query.trim()) {
      // Show recommended models first, then popular ones
      const recommended = models.filter(
        (m) =>
          m.id === RECOMMENDED_MODELS.default ||
          m.id === RECOMMENDED_MODELS.free ||
          m.id === RECOMMENDED_MODELS.reasoning
      );
      const others = models
        .filter((m) => !recommended.includes(m))
        .slice(0, 47); // Limit to 50 total
      return [...recommended, ...others];
    }

    const lowerQuery = query.toLowerCase();
    return models
      .filter(
        (m) =>
          m.name.toLowerCase().includes(lowerQuery) ||
          m.id.toLowerCase().includes(lowerQuery) ||
          m.description?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 50);
  }, [models, query]);

  // Reset highlighted index when filtered results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredModels]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredModels.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredModels[highlightedIndex]) {
          handleSelect(filteredModels[highlightedIndex].id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  const handleSelect = (modelId: string) => {
    onSelect(modelId);
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onSelect('');
    setQuery('');
    inputRef.current?.focus();
  };

  const isRecommended = (modelId: string) =>
    modelId === RECOMMENDED_MODELS.default ||
    modelId === RECOMMENDED_MODELS.free ||
    modelId === RECOMMENDED_MODELS.reasoning;

  return (
    <div className="relative">
      {/* Input field */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : selectedModel?.name || query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay closing to allow click on dropdown items
            setTimeout(() => setIsOpen(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        {selectedModelId && !isOpen && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Selected model info */}
      {selectedModel && !isOpen && (
        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono bg-slate-100 dark:bg-slate-600 px-1.5 py-0.5 rounded">
            {selectedModel.id}
          </span>
          <span>•</span>
          <span>{formatModelPrice(selectedModel.pricing.prompt)}/1K tokens</span>
          {isRecommended(selectedModel.id) && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Sparkles size={10} />
                Recommended
              </span>
            </>
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl"
        >
          {filteredModels.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Loading models...
                </div>
              ) : (
                <>No models found for "{query}"</>
              )}
            </div>
          ) : (
            <>
              {!query && (
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                  Recommended Models
                </div>
              )}
              {filteredModels.map((model, index) => {
                const isHighlighted = index === highlightedIndex;
                const isSelected = model.id === selectedModelId;
                const showDivider =
                  !query &&
                  index === 3 &&
                  filteredModels.length > 3;

                return (
                  <div key={model.id}>
                    {showDivider && (
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 border-y border-slate-100 dark:border-slate-700">
                        All Models
                      </div>
                    )}
                    <button
                      onClick={() => handleSelect(model.id)}
                      className={`w-full px-3 py-2.5 text-left transition-colors ${
                        isHighlighted
                          ? 'bg-indigo-50 dark:bg-indigo-900/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      } ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium text-sm ${
                              isHighlighted || isSelected
                                ? 'text-indigo-700 dark:text-indigo-300'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {model.name}
                          </span>
                          {isRecommended(model.id) && (
                            <Sparkles
                              size={12}
                              className="text-amber-500"
                            />
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatModelPrice(model.pricing.prompt)}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                        {model.id}
                      </div>
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
