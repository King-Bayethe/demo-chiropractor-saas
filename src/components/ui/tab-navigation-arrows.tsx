import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabNavigationArrowsProps {
  tabs: string[];
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const TabNavigationArrows: React.FC<TabNavigationArrowsProps> = ({
  tabs,
  currentTab,
  onTabChange,
  children,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update current index when currentTab changes
  useEffect(() => {
    const index = tabs.indexOf(currentTab);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [currentTab, tabs]);

  const handlePrevious = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    onTabChange(tabs[newIndex]);
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    onTabChange(tabs[newIndex]);
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Get tab label from tab value
  const getTabLabel = (tabValue: string) => {
    const labelMap: Record<string, string> = {
      demographics: 'Demographics',
      accident: 'Accident Details',
      pain: 'Pain Assessment',
      medical: 'Medical History',
      systems: 'Systems Review',
      insurance: 'Insurance',
      legal: 'Legal Information',
      communications: 'Communications',
      emergency: 'Emergency Contact',
      appointments: 'Appointments',
      'soap-notes': 'SOAP Notes',
      files: 'Files',
      invoices: 'Invoices',
      forms: 'Forms',
      providers: 'Providers'
    };
    return labelMap[tabValue] || tabValue;
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={isTransitioning}
          className="h-8 w-8 p-0 rounded-full opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 disabled:opacity-30"
          aria-label="Previous tab"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 relative overflow-hidden rounded-lg bg-muted p-1 min-h-[2.5rem]">
          <div 
            className={cn(
              "flex items-center justify-center transition-all duration-300 ease-in-out",
              isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"
            )}
          >
            <div className="px-3 py-1 bg-background rounded-md shadow-sm border text-sm font-medium text-foreground">
              {getTabLabel(currentTab)}
              <span className="ml-2 text-xs text-muted-foreground">
                {currentIndex + 1} of {tabs.length}
              </span>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={isTransitioning}
          className="h-8 w-8 p-0 rounded-full opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 disabled:opacity-30"
          aria-label="Next tab"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Hidden tabs component for form integration */}
      <div className="sr-only">
        {children}
      </div>
    </div>
  );
};