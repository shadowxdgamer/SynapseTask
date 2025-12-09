// YouTube IFrame API Type Declarations
declare namespace YT {
  interface Player {
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    setVolume(volume: number): void;
    getVolume(): number;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    setPlaybackQuality(quality: SuggestedVideoQuality): void;
    getPlaybackQuality(): string;
    getAvailableQualityLevels(): string[];
    destroy(): void;
    loadVideoById(videoId: string): void;
    cueVideoById(videoId: string): void;
  }

  interface PlayerEvent {
    target: Player;
    data?: number;
  }

  type SuggestedVideoQuality = 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'highres' | 'default';

  interface PlayerOptions {
    height?: string | number;
    width?: string | number;
    videoId?: string;
    playerVars?: {
      autoplay?: 0 | 1;
      controls?: 0 | 1;
      loop?: 0 | 1;
      playlist?: string;
      modestbranding?: 0 | 1;
      rel?: 0 | 1;
      fs?: 0 | 1;
      showinfo?: 0 | 1;
    };
    events?: {
      onReady?: (event: PlayerEvent) => void;
      onStateChange?: (event: PlayerEvent) => void;
      onError?: (event: PlayerEvent) => void;
      onPlaybackQualityChange?: (event: PlayerEvent) => void;
    };
  }

  class Player {
    constructor(elementId: string | HTMLElement, options: PlayerOptions);
  }
}

interface Window {
  YT?: typeof YT & {
    Player: typeof YT.Player;
  };
  onYouTubeIframeAPIReady?: () => void;
}
