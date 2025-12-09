import type { OpenRouterModel } from '../types';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_details?: string;
}

interface ChatCompletionOptions {
  model: string;
  messages: ChatMessage[];
  enableReasoning?: boolean;
  maxTokens?: number;
  temperature?: number;
}

interface ChatCompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
      reasoning_details?: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Fetch available models from OpenRouter
 */
export async function fetchModels(): Promise<OpenRouterModel[]> {
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/models`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

/**
 * Send a chat completion request to OpenRouter
 */
export async function chatCompletion(
  apiKey: string,
  options: ChatCompletionOptions
): Promise<ChatCompletionResponse> {
  const { model, messages, enableReasoning = false, maxTokens, temperature } = options;

  const body: Record<string, unknown> = {
    model,
    messages,
  };

  if (enableReasoning) {
    body.reasoning = { enabled: true };
  }

  if (maxTokens) {
    body.max_tokens = maxTokens;
  }

  if (temperature !== undefined) {
    body.temperature = temperature;
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SynapseTask',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API request failed: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Chat completion error:', error);
    throw error;
  }
}

/**
 * Simple wrapper for single-turn AI requests
 */
export async function askAI(
  apiKey: string,
  model: string,
  prompt: string,
  options?: {
    systemPrompt?: string;
    enableReasoning?: boolean;
  }
): Promise<string> {
  const messages: ChatMessage[] = [];

  if (options?.systemPrompt) {
    messages.push({
      role: 'system',
      content: options.systemPrompt,
    });
  }

  messages.push({
    role: 'user',
    content: prompt,
  });

  const response = await chatCompletion(apiKey, {
    model,
    messages,
    enableReasoning: options?.enableReasoning,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * Validate API key by making a small request
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/auth/key`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
