import React, { useState, useEffect, useRef } from 'react';
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Update current index when currentTab changes
  useEffect(() => {
    const index = tabs.indexOf(currentTab);
    if (index !== -1) {
      setCurrentIndex(index);
      scrollToTab(index);
    }
  }, [currentTab, tabs]);

  const scrollToTab = (index: number) => {
    if (!containerRef.current || !tabsRef.current) return;
    
    const container = containerRef.current;
    const tabsContainer = tabsRef.current;
    const containerWidth = container.offsetWidth;
    const tabsWidth = tabsContainer.offsetWidth;
    const tabWidth = tabsWidth / tabs.length;
    
    // Calculate the scroll position to center the active tab
    const targetScroll = (index * tabWidth) - (containerWidth / 2) + (tabWidth / 2);
    const maxScroll = tabsWidth - containerWidth;
    const newScrollPosition = Math.max(0, Math.min(targetScroll, maxScroll));
    
    setScrollPosition(newScrollPosition);
  };

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
    <div className={cn("relative w-full", className)}>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          className="h-8 w-8 p-0 rounded-full opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
          aria-label="Previous tab"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden relative"
        >
          <div 
            ref={tabsRef}
            className="transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `translateX(-${scrollPosition}px)`,
              width: 'max-content'
            }}
          >
            {children}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="h-8 w-8 p-0 rounded-full opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
          aria-label="Next tab"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};