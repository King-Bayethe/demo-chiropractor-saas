import React from 'react';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/use-breakpoints';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Maximum width containers for different screen sizes
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Padding adjustments for different screen sizes
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Whether to center the content
   */
  centered?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-2xl', 
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-full'
};

const paddingClasses = {
  none: 'p-0',
  sm: 'p-2 sm:p-3 md:p-4',
  md: 'p-3 sm:p-4 md:p-6',
  lg: 'p-4 sm:p-6 md:p-8'
};

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className,
  size = 'full',
  padding = 'md',
  centered = true
}) => {
  const deviceType = useDeviceType();
  
  return (
    <div className={cn(
      'w-full',
      centered && 'mx-auto',
      sizeClasses[size],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
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
   * Gap between grid items
   */
  gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4 md:gap-6',
  lg: 'gap-4 sm:gap-6 md:gap-8'
};

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}) => {
  const gridCols = cn(
    'grid',
    cols.mobile && `grid-cols-${cols.mobile}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    gapClasses[gap]
  );

  return (
    <div className={cn(gridCols, className)}>
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Direction on different screen sizes
   */
  direction?: {
    mobile?: 'vertical' | 'horizontal';
    tablet?: 'vertical' | 'horizontal';
    desktop?: 'vertical' | 'horizontal';
  };
  /**
   * Spacing between stacked items
   */
  spacing?: 'sm' | 'md' | 'lg';
}

const spacingClasses = {
  sm: 'space-y-2 space-x-0 md:space-y-0 md:space-x-2',
  md: 'space-y-3 space-x-0 md:space-y-0 md:space-x-4',
  lg: 'space-y-4 space-x-0 md:space-y-0 md:space-x-6'
};

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  className,
  direction = { mobile: 'vertical', tablet: 'horizontal', desktop: 'horizontal' },
  spacing = 'md'
}) => {
  const flexDirection = cn(
    'flex',
    direction.mobile === 'vertical' ? 'flex-col' : 'flex-row',
    direction.tablet === 'vertical' ? 'md:flex-col' : 'md:flex-row',
    direction.desktop === 'vertical' ? 'lg:flex-col' : 'lg:flex-row',
    spacingClasses[spacing]
  );

  return (
    <div className={cn(flexDirection, className)}>
      {children}
    </div>
  );
};