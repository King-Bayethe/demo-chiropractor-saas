import React from 'react';
import { File, Download, Image, FileText, Music, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FileAttachmentProps {
  attachment: {
    id: string;
    url: string;
    type: string;
    name?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ attachment, size = 'md' }) => {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (mimeType.includes('pdf') || mimeType.includes('text')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = sizeInBytes;
    while (size >= 1024 && i < sizes.length - 1) {
      size /= 1024;
      i++;
    }
    return `${Math.round(size * 10) / 10} ${sizes[i]}`;
  };

  const isImageFile = attachment.type.startsWith('image/');
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name || 'file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isImageFile && size !== 'sm') {
    return (
      <div className="relative group max-w-sm">
        <img 
          src={attachment.url} 
          alt={attachment.name || 'Attachment'} 
          className="rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(attachment.url, '_blank')}
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDownload}
            className="h-8 w-8 p-0"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
        {attachment.name && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {attachment.name}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border bg-muted/50 ${
      size === 'sm' ? 'max-w-xs' : 'max-w-sm'
    }`}>
      <div className="flex-shrink-0">
        {getFileIcon(attachment.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}>
          {attachment.name || 'Unknown file'}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {attachment.type.split('/')[1]?.toUpperCase() || 'FILE'}
          </Badge>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDownload}
        className="flex-shrink-0 h-8 w-8 p-0"
      >
        <Download className="h-3 w-3" />
      </Button>
    </div>
  );
};