import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LofiStream } from '../types';
import { DEFAULT_STREAMS } from '../types/lofi';

interface LofiState {
  // State
  streams: LofiStream[];
  currentStreamId: string | null;
  isPlaying: boolean;
  volume: number;
  isMinimized: boolean;
  
  // Actions
  addStream: (stream: Omit<LofiStream, 'id' | 'isCustom'>) => LofiStream;
  removeStream: (id: string) => void;
  setCurrentStream: (id: string | null) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  toggleMinimized: () => void;
  resetStreams: () => void;
}

export const useLofiStore = create<LofiState>()(
  persist(
    (set, get) => ({
      streams: DEFAULT_STREAMS,
      currentStreamId: null,
      isPlaying: false,
      volume: 50,
      isMinimized: true,

      addStream: (streamInput) => {
        const newStream: LofiStream = {
          id: crypto.randomUUID(),
          name: streamInput.name,
          url: streamInput.url,
          type: streamInput.type,
          isCustom: true,
        };

        set((state) => ({
          ...state,
          streams: [...state.streams, newStream],
        }));

        return newStream;
      },

      removeStream: (id) => {
        const { currentStreamId, isPlaying } = get();
        set((state) => ({
          ...state,
          streams: state.streams.filter((s: LofiStream) => s.id !== id),
          // Stop playing if we removed the current stream
          currentStreamId: currentStreamId === id ? null : currentStreamId,
          isPlaying: currentStreamId === id ? false : isPlaying,
        }));
      },

      setCurrentStream: (id) => {
        set({ currentStreamId: id, isPlaying: id !== null });
      },

      togglePlay: () => {
        const { isPlaying } = get();
        set({ isPlaying: !isPlaying });
      },

      setPlaying: (playing) => {
        set({ isPlaying: playing });
      },

      setVolume: (volume) => {
        set({ volume: Math.max(0, Math.min(100, volume)) });
      },

      toggleMinimized: () => {
        const { isMinimized } = get();
        set({ isMinimized: !isMinimized });
      },

      resetStreams: () => {
        set({ streams: DEFAULT_STREAMS });
      },
    }),
    {
      name: 'synapse-lofi',
    }
  )
);
