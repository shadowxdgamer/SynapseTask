import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Radio,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Music,
  ExternalLink,
  Volume2,
  VolumeX,
  Settings
} from 'lucide-react';
import { useLofiStore } from '../../stores';
import { Input, Button } from '../ui';

// Quality options for data consumption
const QUALITY_OPTIONS = [
  { value: 'small', label: '240p', description: 'Low data' },
  { value: 'medium', label: '360p', description: 'Medium' },
  { value: 'large', label: '480p', description: 'Standard' },
  { value: 'hd720', label: '720p', description: 'HD' },
];

export function LofiPlayer() {
  const {
    streams,
    currentStreamId,
    isPlaying,
    isMinimized,
    volume,
    addStream,
    removeStream,
    setCurrentStream,
    togglePlay,
    toggleMinimized,
    setVolume,
  } = useLofiStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStreamName, setNewStreamName] = useState('');
  const [newStreamUrl, setNewStreamUrl] = useState('');
  const [quality, setQuality] = useState('small');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(50);
  const [playerReady, setPlayerReady] = useState(false);
  
  const playerRef = useRef<YT.Player | null>(null);
  
  const currentStream = streams.find(s => s.id === currentStreamId);

  // Extract YouTube video ID from URL
  const getYouTubeId = useCallback((url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  }, []);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setPlayerReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setPlayerReady(true);
    };
  }, []);

  // Initialize/update YouTube player when stream changes
  useEffect(() => {
    if (!playerReady || !currentStream) return;
    
    const videoId = getYouTubeId(currentStream.url);
    if (!videoId) return;

    // Destroy existing player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        // Ignore errors
      }
      playerRef.current = null;
    }

    // Create new player
    playerRef.current = new window.YT.Player('lofi-player-container', {
      height: '1',
      width: '1',
      videoId: videoId,
      playerVars: {
        autoplay: isPlaying ? 1 : 0,
        loop: 1,
        playlist: videoId,
        controls: 0,
        fs: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event: YT.PlayerEvent) => {
          event.target.setVolume(isMuted ? 0 : volume);
          try {
            event.target.setPlaybackQuality(quality as YT.SuggestedVideoQuality);
          } catch (e) {
            // Quality setting may fail on some videos
          }
          if (isPlaying) {
            event.target.playVideo();
          }
        },
        onStateChange: (event: YT.PlayerEvent) => {
          // YT.PlayerState.ENDED = 0
          if (event.data === 0) {
            // Restart the video for looping
            playerRef.current?.playVideo();
          }
        },
      },
    });
  }, [playerReady, currentStreamId, currentStream?.url, getYouTubeId]);

  // Sync volume with player
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  // Sync play state with player
  useEffect(() => {
    if (!playerRef.current) return;
    
    try {
      if (isPlaying) {
        playerRef.current.playVideo?.();
      } else {
        playerRef.current.pauseVideo?.();
      }
    } catch (e) {
      // Ignore errors if player not ready
    }
  }, [isPlaying]);

  // Sync quality with player
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setPlaybackQuality === 'function') {
      try {
        playerRef.current.setPlaybackQuality(quality as YT.SuggestedVideoQuality);
      } catch (e) {
        // Quality setting may fail
      }
    }
  }, [quality]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [setVolume, isMuted]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, prevVolume, setVolume]);

  const handleAddStream = () => {
    if (newStreamName.trim() && newStreamUrl.trim()) {
      const youtubeId = getYouTubeId(newStreamUrl);
      if (youtubeId) {
        addStream({
          name: newStreamName.trim(),
          url: newStreamUrl.trim(),
          type: 'youtube',
        });
        setNewStreamName('');
        setNewStreamUrl('');
        setShowAddForm(false);
      }
    }
  };

  const handleStreamSelect = (streamId: string) => {
    if (currentStreamId === streamId) {
      togglePlay();
    } else {
      setCurrentStream(streamId);
    }
  };

  const openInNewTab = () => {
    if (currentStream) {
      window.open(currentStream.url, '_blank');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white cursor-pointer"
        onClick={toggleMinimized}
      >
        <div className="flex items-center gap-2">
          <Music size={18} />
          <span className="font-semibold">Lofi Radio</span>
        </div>
        <div className="flex items-center gap-2">
          {currentStream && isPlaying && (
            <>
              <div className="flex gap-0.5">
                <span className="w-0.5 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm truncate max-w-[100px]">{currentStream.name}</span>
            </>
          )}
          {isMinimized ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>
      </div>

      {/* Hidden YouTube player container (audio only) */}
      <div id="lofi-player-container" className="absolute -left-[9999px] h-0 w-0 overflow-hidden" />

      {/* Expanded content */}
      {!isMinimized && (
        <div className="p-4">
          {/* Volume & Quality Controls */}
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300"
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-right">
                {isMuted ? 0 : volume}%
              </span>
            </div>

            {/* Quality Control */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-500 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings size={14} />
                  <span>Quality: {QUALITY_OPTIONS.find(q => q.value === quality)?.label}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform ${showQualityMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showQualityMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 shadow-lg overflow-hidden z-10">
                  {QUALITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setQuality(option.value);
                        setShowQualityMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                        quality === option.value
                          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
                      }`}
                    >
                      <span>{option.label}</span>
                      <span className="text-xs text-slate-400">{option.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stream selector */}
          <div className="space-y-2 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
            {streams.map((stream) => (
              <div
                key={stream.id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  currentStreamId === stream.id
                    ? 'bg-violet-100 dark:bg-violet-900/30'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <button
                  onClick={() => handleStreamSelect(stream.id)}
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  <Radio 
                    size={16} 
                    className={currentStreamId === stream.id && isPlaying 
                      ? 'text-violet-500 animate-pulse' 
                      : 'text-slate-400'
                    } 
                  />
                  <span className={`text-sm truncate ${
                    currentStreamId === stream.id 
                      ? 'text-violet-700 dark:text-violet-300 font-medium' 
                      : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    {stream.name}
                  </span>
                </button>
                {stream.isCustom && (
                  <button
                    onClick={() => removeStream(stream.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={togglePlay}
              disabled={!currentStreamId}
              className={`p-3 rounded-full text-white transition-all ${
                currentStreamId
                  ? 'bg-violet-500 hover:bg-violet-600'
                  : 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed'
              }`}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>

            {/* Open in new tab for background playback */}
            <button
              onClick={openInNewTab}
              disabled={!currentStreamId}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentStreamId
                  ? 'text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
              title="Open in YouTube for background playback"
            >
              <ExternalLink size={16} />
              Open in YouTube
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            💡 Tip: Minimize this card and the music will keep playing!
          </p>

          {/* Add custom stream */}
          {showAddForm ? (
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <Input
                value={newStreamName}
                onChange={(e) => setNewStreamName(e.target.value)}
                placeholder="Stream name..."
                className="text-sm py-1.5"
              />
              <Input
                value={newStreamUrl}
                onChange={(e) => setNewStreamUrl(e.target.value)}
                placeholder="YouTube URL..."
                className="text-sm py-1.5"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddStream}>
                  Add
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Add Custom Stream
            </button>
          )}
        </div>
      )}
    </div>
  );
}
