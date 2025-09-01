import React from 'react';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/use-breakpoints';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';

interface ResponsiveDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  className?: string;
  /**
   * Whether to use drawer on mobile instead of dialog
   */
  useDrawerOnMobile?: boolean;
  /**
   * Footer content
   */
  footer?: React.ReactNode;
}

export const ResponsiveDialog: React.FC<ResponsiveDialogProps> = ({
  children,
  open,
  onOpenChange,
  title,
  description,
  className,
  useDrawerOnMobile = true,
  footer
}) => {
  const deviceType = useDeviceType();

  if (deviceType === 'mobile' && useDrawerOnMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={cn("max-h-[85vh]", className)}>
          {title && (
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              {description && (
                <DrawerDescription>{description}</DrawerDescription>
              )}
            </DrawerHeader>
          )}
          <div className="px-4 pb-4 overflow-y-auto">
            {children}
          </div>
          {footer && (
            <DrawerFooter className="pt-2">
              {footer}
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        // Responsive sizing
        "w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl",
        // Mobile optimizations
        deviceType === 'mobile' && "max-w-[95vw] max-h-[85vh] overflow-y-auto",
        className
      )}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        <div className="overflow-y-auto">
          {children}
        </div>
        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};