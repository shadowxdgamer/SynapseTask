export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  supported_parameters: string[];
  architecture?: {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
  };
}

export interface ModelSelectorState {
  models: OpenRouterModel[];
  selectedModelId: string;
  customModelId: string | null;
  isLoading: boolean;
  error: string | null;
}

// Recommended models for different use cases
export const RECOMMENDED_MODELS = {
  default: 'deepseek/deepseek-v3.2',
  free: 'meta-llama/llama-3-8b-instruct:free',
  reasoning: 'deepseek/deepseek-v3.2',
  fast: 'essentialai/rnj-1-instruct',
} as const;

// Format price for display (per 1M tokens)
export const formatModelPrice = (price: string): string => {
  const num = parseFloat(price);
  if (num === 0) return 'Free';
  if (num < 0) return 'Variable';
  return `$${(num * 1000000).toFixed(2)}/1M`;
};
