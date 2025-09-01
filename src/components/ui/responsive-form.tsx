import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsiveConfig } from '@/hooks/use-responsive';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ResponsiveFormProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Whether to stack form fields on mobile
   */
  mobileStack?: boolean;
  /**
   * Form layout configuration
   */
  layout?: 'single' | 'two-column' | 'three-column';
}

export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  className,
  mobileStack = true,
  layout = 'single'
}) => {
  const { deviceType } = useResponsiveConfig();

  const getLayoutClasses = () => {
    if (deviceType === 'mobile' && mobileStack) {
      return 'space-y-4';
    }

    switch (layout) {
      case 'two-column':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6';
      case 'three-column':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6';
      default:
        return 'space-y-4 md:space-y-6';
    }
  };

  return (
    <div className={cn(
      getLayoutClasses(),
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveFormFieldProps {
  children: React.ReactNode;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /**
   * Whether this field should span full width on grid layouts
   */
  fullWidth?: boolean;
}

export const ResponsiveFormField: React.FC<ResponsiveFormFieldProps> = ({
  children,
  label,
  description,
  error,
  required,
  className,
  fullWidth
}) => {
  const { deviceType } = useResponsiveConfig();

  return (
    <div className={cn(
      'space-y-2',
      fullWidth && 'md:col-span-2 lg:col-span-3',
      className
    )}>
      {label && (
        <Label className={cn(
          "text-sm font-medium",
          deviceType === 'mobile' && "text-xs",
          error && "text-destructive"
        )}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      {children}
      
      {description && (
        <p className={cn(
          "text-xs text-muted-foreground",
          deviceType === 'mobile' && "text-xs"
        )}>
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

interface ResponsiveFormActionsProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Whether to stack buttons on mobile
   */
  mobileStack?: boolean;
  /**
   * Button alignment
   */
  align?: 'left' | 'center' | 'right';
}

export const ResponsiveFormActions: React.FC<ResponsiveFormActionsProps> = ({
  children,
  className,
  mobileStack = true,
  align = 'right'
}) => {
  const { deviceType } = useResponsiveConfig();

  const getFlexClasses = () => {
    const baseClasses = 'flex gap-3';
    
    if (deviceType === 'mobile' && mobileStack) {
      return `${baseClasses} flex-col`;
    }

    switch (align) {
      case 'left':
        return `${baseClasses} justify-start`;
      case 'center':
        return `${baseClasses} justify-center`;
      case 'right':
      default:
        return `${baseClasses} justify-end`;
    }
  };

  return (
    <div className={cn(
      getFlexClasses(),
      'pt-4 mt-6 border-t border-border',
      className
    )}>
      {children}
    </div>
  );
};