import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TabItem {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface TabNavigationArrowsProps {
  tabs: TabItem[]
  currentValue: string
  onTabChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function TabNavigationArrows({
  tabs,
  currentValue,
  onTabChange,
  children,
  className
}: TabNavigationArrowsProps) {
  const currentIndex = tabs.findIndex(tab => tab.value === currentValue)
  const totalTabs = tabs.length

  const handlePrevious = () => {
    const prevIndex = currentIndex === 0 ? totalTabs - 1 : currentIndex - 1
    onTabChange(tabs[prevIndex].value)
  }

  const handleNext = () => {
    const nextIndex = currentIndex === totalTabs - 1 ? 0 : currentIndex + 1
    onTabChange(tabs[nextIndex].value)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && 
          (event.target.closest('[role="tablist"]') || event.target.closest('.tab-navigation-container'))) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          handlePrevious()
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          handleNext()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, totalTabs])

  return (
    <div className={cn("relative w-full tab-navigation-container", className)}>
      {/* Navigation Controls Container */}
      <div className="flex items-center justify-between mb-2">
        {/* Left Arrow */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background shadow-sm shrink-0"
          aria-label={`Previous tab: ${tabs[currentIndex === 0 ? totalTabs - 1 : currentIndex - 1]?.label}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Tab Position Indicator */}
        <div className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md border border-border/50">
          {currentIndex + 1} of {totalTabs}
        </div>

        {/* Right Arrow */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background shadow-sm shrink-0"
          aria-label={`Next tab: ${tabs[currentIndex === totalTabs - 1 ? 0 : currentIndex + 1]?.label}`}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Tab Content - Full Width */}
      <div className="w-full overflow-x-auto scrollbar-hide">
        {children}
      </div>
    </div>
  )
}