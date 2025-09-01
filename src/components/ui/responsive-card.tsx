import React from 'react';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/use-breakpoints';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Whether to optimize padding for mobile
   */
  mobilePadding?: boolean;
  /**
   * Whether to make the card full width on mobile
   */
  mobileFullWidth?: boolean;
  /**
   * Whether to remove shadow on mobile for cleaner list views
   */
  mobileFlat?: boolean;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className,
  mobilePadding = true,
  mobileFullWidth = true,
  mobileFlat = false
}) => {
  const deviceType = useDeviceType();

  return (
    <Card
      className={cn(
        // Base styles
        className,
        // Mobile optimizations
        deviceType === 'mobile' && mobilePadding && "p-3",
        deviceType === 'mobile' && mobileFullWidth && "w-full",
        deviceType === 'mobile' && mobileFlat && "shadow-none border-0 border-b rounded-none"
      )}
    >
      {children}
    </Card>
  );
};

interface ResponsiveCardGridProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Number of columns for different screen sizes
   */
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  /**
   * Gap between cards
   */
  gap?: 'sm' | 'md' | 'lg';
  /**
   * Whether to use mobile-optimized card styles
   */
  mobileOptimized?: boolean;
}

const gapClasses = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4 md:gap-6',
  lg: 'gap-4 sm:gap-6 md:gap-8'
};

export const ResponsiveCardGrid: React.FC<ResponsiveCardGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  mobileOptimized = true
}) => {
  const deviceType = useDeviceType();

  const gridCols = cn(
    'grid',
    cols.mobile && `grid-cols-${cols.mobile}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    gapClasses[gap]
  );

  return (
    <div className={cn(
      gridCols,
      // Mobile optimizations
      deviceType === 'mobile' && mobileOptimized && "space-y-0",
      className
    )}>
      {children}
    </div>
  );
};