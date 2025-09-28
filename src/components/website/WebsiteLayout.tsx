import React from 'react';
import { WebsiteHeader } from './WebsiteHeader';
import { WebsiteFooter } from './WebsiteFooter';
import { cn } from '@/lib/utils';

interface WebsiteLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const WebsiteLayout: React.FC<WebsiteLayoutProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <WebsiteHeader />
      <main className={cn("flex-1", className)}>
        {children}
      </main>
      <WebsiteFooter />
    </div>
  );
};