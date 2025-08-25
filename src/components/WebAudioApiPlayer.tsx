import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Download, ExternalLink, Volume2 } from 'lucide-react';
import { AudioDownloadButton } from './AudioDownloadButton';

interface WebAudioApiPlayerProps {
  audioUrl?: string;
  base64Audio?: string;
  fileName?: string;
  className?: string;
}

export const WebAudioApiPlayer = ({ 
  audioUrl, 
  base64Audio, 
  fileName = 'audio',
  className = '' 
}: WebAudioApiPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }

    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
    };
  }, []);

  // Load audio data
  useEffect(() => {
    if (base64Audio || audioUrl) {
      loadAudio();
    }
  }, [base64Audio, audioUrl]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume[0] / 100;
    }
  }, [volume]);

  const loadAudio = async () => {
    if (!audioContextRef.current) return;

    setLoading(true);
    setError(null);

    try {
      let arrayBuffer: ArrayBuffer;

      if (base64Audio) {
        // Handle base64 data URL or raw base64
        const base64Data = base64Audio.includes(',') 
          ? base64Audio.split(',')[1] 
          : base64Audio;
        
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      } else if (audioUrl) {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error('Failed to fetch audio');
        arrayBuffer = await response.arrayBuffer();
      } else {
        throw new Error('No audio source provided');
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;
      setDuration(audioBuffer.duration);
    } catch (err) {
      console.error('Error loading audio:', err);
      setError(err instanceof Error ? err.message : 'Failed to load audio');
    } finally {
      setLoading(false);
    }
  };

  const play = () => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Stop current source if playing
    if (sourceRef.current) {
      sourceRef.current.stop();
    }

    // Create new source
    sourceRef.current = audioContextRef.current.createBufferSource();
    sourceRef.current.buffer = audioBufferRef.current;
    sourceRef.current.connect(gainNodeRef.current!);

    // Set up ended handler
    sourceRef.current.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      offsetRef.current = 0;
    };

    // Start playing from offset
    sourceRef.current.start(0, offsetRef.current);
    startTimeRef.current = audioContextRef.current.currentTime - offsetRef.current;
    setIsPlaying(true);

    // Update current time
    updateCurrentTime();
  };

  const pause = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      offsetRef.current = currentTime;
      setIsPlaying(false);
    }
  };

  const updateCurrentTime = () => {
    if (isPlaying && audioContextRef.current) {
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
      setCurrentTime(elapsed);
      
      if (elapsed < duration) {
        requestAnimationFrame(updateCurrentTime);
      }
    }
  };

  const seek = (newTime: number) => {
    setCurrentTime(newTime);
    offsetRef.current = newTime;

    if (isPlaying) {
      pause();
      setTimeout(play, 10);
    }
  };

  const openInNewTab = () => {
    if (base64Audio) {
      const dataUrl = base64Audio.startsWith('data:') 
        ? base64Audio 
        : `data:audio/mpeg;base64,${base64Audio}`;
      window.open(dataUrl, '_blank');
    } else if (audioUrl) {
      window.open(audioUrl, '_blank');
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-muted rounded-lg ${className}`}>
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Loading audio...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-destructive/10 rounded-lg ${className}`}>
        <span className="text-sm text-destructive">Error: {error}</span>
      </div>
    );
  }

  if (!audioBufferRef.current) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-3 p-4 bg-card border rounded-lg ${className}`}>
      {/* Main controls */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={isPlaying ? pause : play}
          disabled={!audioBufferRef.current}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>

        {/* Progress */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground min-w-[35px]">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={(value) => seek(value[0])}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground min-w-[35px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={volume}
            max={100}
            step={1}
            onValueChange={setVolume}
            className="w-16"
          />
        </div>
      </div>

      {/* Additional controls */}
      <div className="flex items-center gap-2">
        <AudioDownloadButton 
          audioUrl={audioUrl}
          base64Audio={base64Audio}
          fileName={fileName}
          size="sm"
        />
        
        <Button
          size="sm"
          variant="ghost"
          onClick={openInNewTab}
          className="text-xs"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Open
        </Button>
      </div>
    </div>
  );
};