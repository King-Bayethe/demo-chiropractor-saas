import React from 'react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { ChevronDown, Check } from 'lucide-react';

interface FormSectionProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  number?: number;
  defaultOpen?: boolean;
  isCompleted?: boolean;
  className?: string;
  contentClassName?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  subtitle,
  number,
  defaultOpen = false,
  isCompleted = false,
  className,
  contentClassName
}) => {
  return (
    <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            {number && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
                {number}
              </div>
            )}
            <div className="text-left">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {title}
                {isCompleted && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </h2>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className={cn("bg-background", contentClassName)}>
          <div className="p-6">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};