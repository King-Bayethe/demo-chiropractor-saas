import React from 'react';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/use-breakpoints';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

interface ResponsiveNavigationProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Content to show in mobile sheet header
   */
  mobileTitle?: string;
  /**
   * Trigger element for mobile navigation
   */
  mobileTrigger?: React.ReactNode;
  /**
   * Whether the mobile sheet is open
   */
  mobileOpen?: boolean;
  /**
   * Callback when mobile sheet open state changes
   */
  onMobileOpenChange?: (open: boolean) => void;
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  children,
  className,
  mobileTitle = "Navigation",
  mobileTrigger,
  mobileOpen,
  onMobileOpenChange
}) => {
  const deviceType = useDeviceType();

  if (deviceType === 'mobile') {
    return (
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetTrigger asChild>
          {mobileTrigger || (
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          )}
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>{mobileTitle}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={cn("hidden md:block", className)}>
      {children}
    </div>
  );
};

interface ResponsiveTabsProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Whether to stack tabs vertically on mobile
   */
  mobileStack?: boolean;
  /**
   * Whether to make tabs scrollable on mobile
   */
  mobileScrollable?: boolean;
}

export const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({
  children,
  className,
  mobileStack = false,
  mobileScrollable = true
}) => {
  const deviceType = useDeviceType();

  return (
    <div className={cn(
      "w-full",
      deviceType === 'mobile' && mobileStack && "flex flex-col",
      deviceType === 'mobile' && mobileScrollable && !mobileStack && "overflow-x-auto",
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Whether to enable horizontal scrolling on smaller screens
   */
  scrollable?: boolean;
  /**
   * Minimum width for the table content
   */
  minWidth?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className,
  scrollable = true,
  minWidth = "600px"
}) => {
  const deviceType = useDeviceType();

  if (deviceType === 'mobile' && scrollable) {
    return (
      <div className="overflow-x-auto">
        <div style={{ minWidth }} className={className}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
};