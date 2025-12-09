import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OpenRouterModel } from '../types';

interface ModelCacheState {
  models: OpenRouterModel[];
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setModels: (models: OpenRouterModel[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  shouldRefetch: () => boolean;
  clearCache: () => void;
}

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export const useModelCacheStore = create<ModelCacheState>()(
  persist(
    (set, get) => ({
      models: [],
      lastFetched: null,
      isLoading: false,
      error: null,

      setModels: (models) => set({ 
        models, 
        lastFetched: Date.now(),
        error: null 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      shouldRefetch: () => {
        const { lastFetched, models } = get();
        // Refetch if never fetched, empty cache, or cache expired
        if (!lastFetched || models.length === 0) return true;
        return Date.now() - lastFetched > CACHE_DURATION;
      },

      clearCache: () => set({ 
        models: [], 
        lastFetched: null, 
        error: null 
      }),
    }),
    {
      name: 'synapse-model-cache',
      partialize: (state) => ({
        models: state.models,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
