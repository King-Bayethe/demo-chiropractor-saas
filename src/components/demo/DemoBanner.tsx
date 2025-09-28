import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, ExternalLink, Github, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DemoBannerProps {
  className?: string;
  variant?: 'top' | 'floating' | 'embedded';
  onDismiss?: () => void;
  showSourceCode?: boolean;
  showPortfolioLink?: boolean;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  className,
  variant = 'top',
  onDismiss,
  showSourceCode = true,
  showPortfolioLink = true
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  const bannerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-medical-blue" />
          <span className="font-semibold text-foreground">Portfolio Demo</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="secondary" className="bg-medical-blue/10 text-medical-blue">
            Healthcare SaaS Platform
          </Badge>
          <Badge variant="outline" className="text-xs">
            Full-Stack Development Showcase
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {showSourceCode && (
          <Button 
            variant="outline" 
            size="sm"
            className="hidden sm:flex items-center gap-1"
            onClick={() => window.open('https://github.com', '_blank')}
          >
            <Github className="h-3 w-3" />
            View Source
          </Button>
        )}
        
        {showPortfolioLink && (
          <Button 
            variant="outline" 
            size="sm"
            className="hidden md:flex items-center gap-1"
            onClick={() => window.open('https://portfolio-link.com', '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
            Developer Portfolio
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (variant === 'floating') {
    return (
      <div className={cn(
        "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-4xl mx-auto",
        className
      )}>
        <Alert className="border-medical-blue/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
          <AlertDescription>
            {bannerContent}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (variant === 'embedded') {
    return (
      <div className={cn("w-full", className)}>
        <Alert className="border-medical-blue/20 bg-medical-blue/5">
          <AlertDescription>
            {bannerContent}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Default 'top' variant
  return (
    <div className={cn(
      "sticky top-0 z-50 w-full border-b border-medical-blue/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-medical-blue/10 rounded">
                <Code className="h-4 w-4 text-medical-blue" />
              </div>
              <span className="font-medium text-foreground text-sm">
                Healthcare Portfolio Demo
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="secondary" className="bg-medical-blue/10 text-medical-blue text-xs">
                Interactive Showcase
              </Badge>
              <span className="text-xs text-muted-foreground">
                Full-stack healthcare management platform demonstration
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showSourceCode && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs hidden sm:flex"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <Github className="h-3 w-3 mr-1" />
                Source Code
              </Button>
            )}
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleDismiss}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};