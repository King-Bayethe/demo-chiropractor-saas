import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { ButtonProps } from '@/components/ui/button';

interface TranscriptionDownloadProps extends Omit<ButtonProps, 'onClick'> {
  transcriptionText?: string;
  fileName?: string;
  contactName?: string;
  messageDate?: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: string) => void;
}

export const TranscriptionDownload = ({
  transcriptionText,
  fileName = 'transcription',
  contactName,
  messageDate,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
  disabled,
  children,
  ...buttonProps
}: TranscriptionDownloadProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadTranscription = async () => {
    if (!transcriptionText || !transcriptionText.trim()) {
      onDownloadError?.('No transcription text available');
      return;
    }

    setIsDownloading(true);
    onDownloadStart?.();

    try {
      // Format the transcription content
      let content = '';
      
      // Add header information if available
      if (contactName || messageDate) {
        content += '='.repeat(50) + '\n';
        content += 'CALL TRANSCRIPTION\n';
        content += '='.repeat(50) + '\n\n';
        
        if (contactName) {
          content += `Contact: ${contactName}\n`;
        }
        if (messageDate) {
          content += `Date: ${messageDate}\n`;
        }
        content += `Generated: ${new Date().toLocaleString()}\n\n`;
        content += '-'.repeat(50) + '\n\n';
      }
      
      // Add the transcription text
      content += transcriptionText.trim();
      
      // Add footer
      content += '\n\n' + '-'.repeat(50) + '\n';
      content += 'End of Transcription\n';

      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Generate filename
      let finalFileName = fileName;
      if (!finalFileName.endsWith('.txt')) {
        finalFileName += '.txt';
      }
      
      // Add contact name and date to filename if available
      if (contactName || messageDate) {
        const namePart = contactName ? contactName.replace(/[^a-zA-Z0-9]/g, '_') : '';
        const datePart = messageDate ? new Date(messageDate).toISOString().split('T')[0] : '';
        const parts = ['transcription', namePart, datePart].filter(Boolean);
        finalFileName = parts.join('_') + '.txt';
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onDownloadComplete?.();
    } catch (error) {
      console.error('Transcription download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      onDownloadError?.(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const hasTranscription = transcriptionText && transcriptionText.trim().length > 0;

  return (
    <Button
      onClick={downloadTranscription}
      disabled={disabled || isDownloading || !hasTranscription}
      variant="outline"
      size="sm"
      {...buttonProps}
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileText className="w-4 h-4 mr-2" />
      )}
      {children || (isDownloading ? 'Downloading...' : 'Download Transcript')}
    </Button>
  );
};