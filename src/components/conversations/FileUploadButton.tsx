import React, { useRef, useState } from 'react';
import { Paperclip, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface FileUploadButtonProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  maxFiles = 5,
  maxSizeInMB = 10,
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', '.doc', '.docx'],
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `${file.name} is larger than ${maxSizeInMB}MB`,
        variant: "destructive"
      });
      return false;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.type === type || file.name.toLowerCase().endsWith(type);
    });

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not a supported file type`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileSelection = (files: FileList) => {
    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(validateFile);
    
    if (selectedFiles.length + validFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only select up to ${maxFiles} files`,
        variant: "destructive"
      });
      return;
    }

    if (validFiles.length > 0) {
      onFilesSelected([...selectedFiles, ...validFiles]);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 10) / 10} ${sizes[i]}`;
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative transition-colors ${
          isDragOver ? 'opacity-75' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClick}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => {
            if (e.target.files) {
              handleFileSelection(e.target.files);
            }
            e.target.value = '';
          }}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-1">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm"
            >
              <Upload className="h-3 w-3 flex-shrink-0" />
              <span className="flex-1 truncate">{file.name}</span>
              <Badge variant="outline" className="text-xs">
                {formatFileSize(file.size)}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(index)}
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
          <p className="text-sm font-medium text-primary">Drop files here</p>
        </div>
      )}
    </div>
  );
};