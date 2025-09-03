import React from 'react';
import { cn } from '@/lib/utils';
import { ResponsiveGrid } from './responsive-layout';

interface FormFieldGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FormFieldGrid: React.FC<FormFieldGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 2 },
  gap = 'md',
  className
}) => {
  return (
    <ResponsiveGrid
      cols={cols}
      gap={gap}
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
};

interface FormFieldProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  fullWidth = false,
  className
}) => {
  return (
    <div className={cn(
      fullWidth && "md:col-span-2",
      className
    )}>
      {children}
    </div>
  );
};

interface DocumentUploadSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  children,
  title = "Document Uploads",
  subtitle = "Subida de Documentos",
  className
}) => {
  return (
    <div className={cn(
      "mt-6 p-4 bg-muted/30 rounded-lg border border-border/50",
      className
    )}>
      <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border/50">
        {title} <span className="text-muted-foreground">({subtitle})</span>
      </h3>
      <FormFieldGrid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
        {children}
      </FormFieldGrid>
    </div>
  );
};