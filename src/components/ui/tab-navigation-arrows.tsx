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
      {/* Left Arrow */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background shadow-sm"
        aria-label={`Previous tab: ${tabs[currentIndex === 0 ? totalTabs - 1 : currentIndex - 1]?.label}`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Tab Content */}
      <div className="px-10">
        {children}
      </div>

      {/* Right Arrow */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background shadow-sm"
        aria-label={`Next tab: ${tabs[currentIndex === totalTabs - 1 ? 0 : currentIndex + 1]?.label}`}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Tab Position Indicator */}
      <div className="absolute top-0 right-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-b-md border-x border-b border-border/50">
        {currentIndex + 1} of {totalTabs}
      </div>
    </div>
  )
}