export type StreamType = 'youtube' | 'direct';

export interface LofiStream {
  id: string;
  name: string;
  url: string;
  type: StreamType;
  isCustom: boolean;
}

export interface LofiPlayerState {
  streams: LofiStream[];
  currentStreamId: string | null;
  isPlaying: boolean;
  volume: number; // 0-100
  isMinimized: boolean;
}

// Default lofi streams
export const DEFAULT_STREAMS: LofiStream[] = [
  {
    id: 'lofi-girl',
    name: 'Lofi Girl',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    type: 'youtube',
    isCustom: false,
  },
  {
    id: 'chillhop',
    name: 'Chillhop',
    url: 'https://www.youtube.com/watch?v=5yx6BWlEVcY',
    type: 'youtube',
    isCustom: false,
  },
  {
    id: 'coffee-shop',
    name: 'Coffee Shop Radio',
    url: 'https://www.youtube.com/watch?v=lTRiuFIWV54',
    type: 'youtube',
    isCustom: false,
  },
];

// Extract YouTube video ID from URL
export const extractYouTubeId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
