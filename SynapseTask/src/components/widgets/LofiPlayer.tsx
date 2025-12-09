import { useState } from 'react';
import { 
  Play, 
  Pause, 
  Radio,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Music,
  ExternalLink
} from 'lucide-react';
import { useLofiStore } from '../../stores';
import { Input, Button } from '../ui';

export function LofiPlayer() {
  const {
    streams,
    currentStreamId,
    isPlaying,
    isMinimized,
    addStream,
    removeStream,
    setCurrentStream,
    togglePlay,
    toggleMinimized,
  } = useLofiStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStreamName, setNewStreamName] = useState('');
  const [newStreamUrl, setNewStreamUrl] = useState('');

  const currentStream = streams.find(s => s.id === currentStreamId);

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

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

      {/* Single YouTube iframe - always rendered when playing, visibility changes based on minimized state */}
      {currentStream && isPlaying && getYouTubeId(currentStream.url) && (
        <div 
          className={`transition-all duration-300 ${
            isMinimized 
              ? 'h-0 w-0 overflow-hidden absolute -left-[9999px]' 
              : 'mx-4 mt-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700'
          }`}
        >
          <iframe
            width="100%"
            height={isMinimized ? '0' : '120'}
            src={`https://www.youtube.com/embed/${getYouTubeId(currentStream.url)}?autoplay=1&loop=1&controls=1&modestbranding=1&rel=0&vq=small`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="border-0"
          />
        </div>
      )}

      {/* Expanded content */}
      {!isMinimized && (
        <div className="p-4 pt-2">
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
