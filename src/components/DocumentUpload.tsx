import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, IdCard, CreditCard, FileText, Check } from "lucide-react";

interface DocumentUploadProps {
  documentType: 'drivers-license-front' | 'drivers-license-back' | 'insurance-card-front' | 'insurance-card-back';
  label: string;
  spanishLabel?: string;
  onUploadComplete?: (fileName: string) => void;
  className?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  label,
  spanishLabel,
  onUploadComplete,
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string>("");

  const getIcon = () => {
    switch (documentType) {
      case 'drivers-license-front':
      case 'drivers-license-back':
        return <IdCard className="h-4 w-4" />;
      case 'insurance-card-front':
      case 'insurance-card-back':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}-${Date.now()}.${fileExt}`;
      const filePath = `form-documents/${fileName}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) throw error;

      setUploadedFile(fileName);
      onUploadComplete?.(fileName);
      toast.success(`${label} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${label}`);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileUpload(file);
    };
    input.click();
  };

  return (
    <div className={className}>
      <Label className="text-gray-600 font-medium mb-2 block">
        {label} {spanishLabel && <span className="text-muted-foreground">/ {spanishLabel}</span>}
      </Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={handleClick}
          className="rounded-md border-gray-300"
        >
          {getIcon()}
          {uploading ? 'Uploading...' : `Upload ${label}`}
        </Button>
        {uploadedFile && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Uploaded
          </span>
        )}
      </div>
    </div>
  );
};