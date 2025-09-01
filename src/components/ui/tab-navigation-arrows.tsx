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
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      if (!containerRef.current || !tabsRef.current) return;
      
      const container = containerRef.current;
      const tabsContainer = tabsRef.current;
      const containerWidth = container.offsetWidth;
      const tabsWidth = tabsContainer.scrollWidth;
      
      // No need to scroll if everything fits
      if (tabsWidth <= containerWidth) {
        setScrollPosition(0);
        return;
      }
      
      // Find the actual tab element - could be direct child or nested
      const children = Array.from(tabsContainer.children) as HTMLElement[];
      let targetTab: HTMLElement | null = null;
      
      // First try direct children
      if (children[index]) {
        targetTab = children[index];
      } else {
        // If not found, look for tab triggers within children
        for (const child of children) {
          const triggers = child.querySelectorAll('[role="tab"], [data-state]');
          if (triggers[index]) {
            targetTab = triggers[index] as HTMLElement;
            break;
          }
        }
      }
      
      if (!targetTab) return;
      
      const tabLeft = targetTab.offsetLeft;
      const tabWidth = targetTab.offsetWidth;
      const tabRight = tabLeft + tabWidth;
      const padding = 20; // Consistent padding
      
      let newScrollPosition = scrollPosition;
      
      // Simple logic: ensure the tab is visible with padding
      if (tabLeft < scrollPosition + padding) {
        // Tab is cut off on the left
        newScrollPosition = Math.max(0, tabLeft - padding);
      } else if (tabRight > scrollPosition + containerWidth - padding) {
        // Tab is cut off on the right
        newScrollPosition = Math.min(
          tabsWidth - containerWidth,
          tabRight - containerWidth + padding
        );
      }
      
      setScrollPosition(newScrollPosition);
    });
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
          className="h-8 w-8 p-0 rounded-full opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105 flex-shrink-0"
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
          className="h-8 w-8 p-0 rounded-full opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105 flex-shrink-0"
          aria-label="Next tab"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};