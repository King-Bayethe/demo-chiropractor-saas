import React from 'react';
import { cn } from '@/lib/utils';
import { ResponsiveLayout } from './responsive-layout';

interface PublicFormLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export const PublicFormLayout: React.FC<PublicFormLayoutProps> = ({
  children,
  title,
  subtitle,
  className
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20 overflow-y-auto">
      <ResponsiveLayout size="xl" padding="lg" className={cn("py-8", className)}>
        <div className="bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 mb-8">
          {/* Header */}
          <header className="text-center py-8 px-6 border-b border-border/50">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-muted-foreground">
                {subtitle}
              </p>
            )}
          </header>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {children}
          </div>
        </div>
      </ResponsiveLayout>
    </div>
  );
};