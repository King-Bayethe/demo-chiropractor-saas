import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { ButtonProps } from '@/components/ui/button';

interface AudioDownloadButtonProps extends Omit<ButtonProps, 'onClick'> {
  audioUrl?: string;
  base64Audio?: string;
  fileName?: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: string) => void;
}

export const AudioDownloadButton = ({
  audioUrl,
  base64Audio,
  fileName = 'audio',
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
  disabled,
  children,
  ...buttonProps
}: AudioDownloadButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const detectAudioFormat = (data: string): { mimeType: string; extension: string } => {
    // Check for data URL with mime type
    if (data.startsWith('data:')) {
      const mimeMatch = data.match(/data:([^;]+)/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1];
        const extension = mimeType.split('/')[1] || 'bin';
        return { mimeType, extension };
      }
    }

    // Try to detect from base64 header
    try {
      const base64Data = data.includes(',') ? data.split(',')[1] : data;
      const binaryString = atob(base64Data.substring(0, 20));
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Check for common audio file signatures
      const header = Array.from(bytes.slice(0, 12))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (header.startsWith('494433') || header.includes('fff3') || header.includes('fff2')) {
        return { mimeType: 'audio/mpeg', extension: 'mp3' };
      }
      if (header.startsWith('52494646') && header.includes('57415645')) {
        return { mimeType: 'audio/wav', extension: 'wav' };
      }
      if (header.startsWith('4f676753')) {
        return { mimeType: 'audio/ogg', extension: 'ogg' };
      }
      if (header.startsWith('664c6143')) {
        return { mimeType: 'audio/flac', extension: 'flac' };
      }
      if (header.includes('667479704d3441')) {
        return { mimeType: 'audio/mp4', extension: 'm4a' };
      }
    } catch (error) {
      console.warn('Could not detect audio format:', error);
    }

    // Default fallback
    return { mimeType: 'audio/mpeg', extension: 'mp3' };
  };

  const downloadAudio = async () => {
    if (!audioUrl && !base64Audio) {
      onDownloadError?.('No audio source provided');
      return;
    }

    setIsDownloading(true);
    onDownloadStart?.();

    try {
      let blob: Blob;
      let finalFileName = fileName;

      if (base64Audio) {
        // Handle base64 audio
        const { mimeType, extension } = detectAudioFormat(base64Audio);
        
        const base64Data = base64Audio.includes(',') 
          ? base64Audio.split(',')[1] 
          : base64Audio;

        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        blob = new Blob([bytes], { type: mimeType });
        
        // Add extension if not present
        if (!finalFileName.includes('.')) {
          finalFileName = `${finalFileName}.${extension}`;
        }
      } else if (audioUrl) {
        // Handle URL
        const response = await fetch(audioUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.statusText}`);
        }
        
        blob = await response.blob();
        
        // Try to get filename from URL or Content-Disposition header
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch) {
            finalFileName = filenameMatch[1].replace(/['"]/g, '');
          }
        } else {
          // Extract from URL
          const urlPath = new URL(audioUrl).pathname;
          const urlFileName = urlPath.split('/').pop();
          if (urlFileName && urlFileName.includes('.')) {
            finalFileName = urlFileName;
          }
        }
      } else {
        throw new Error('No valid audio source');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onDownloadComplete?.();
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      onDownloadError?.(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={downloadAudio}
      disabled={disabled || isDownloading || (!audioUrl && !base64Audio)}
      {...buttonProps}
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {children || (isDownloading ? 'Downloading...' : 'Download')}
    </Button>
  );
};