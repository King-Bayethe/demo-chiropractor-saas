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

  // Update current index when currentTab changes
  useEffect(() => {
    const index = tabs.indexOf(currentTab);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [currentTab, tabs]);

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    onTabChange(tabs[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    onTabChange(tabs[newIndex]);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          className="h-6 w-6 p-0 rounded-full opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Previous tab"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        
        <div className="flex-1 mx-2">
          {children}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="h-6 w-6 p-0 rounded-full opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Next tab"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};