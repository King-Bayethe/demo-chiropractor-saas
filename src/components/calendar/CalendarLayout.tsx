import { ReactNode } from "react";
import { CalendarSidebar } from "./CalendarSidebar";
import { CalendarHeader } from "./CalendarHeader";
import { useIsMobile, useDeviceType } from "@/hooks/use-breakpoints";
import { cn } from "@/lib/utils";

interface CalendarLayoutProps {
  children: ReactNode;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onCreateAppointment: () => void;
  filters: {
    status: string[];
    types: string[];
  };
  onFiltersChange: (filters: any) => void;
  isSidebarCollapsed: boolean;
  onSidebarToggle: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onRemindersClick?: () => void;
  onSettingsClick?: () => void;
  todaysStats?: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
}

export function CalendarLayout({
  children,
  view,
  onViewChange,
  currentDate,
  onDateChange,
  onCreateAppointment,
  filters,
  onFiltersChange,
  isSidebarCollapsed,
  onSidebarToggle,
  searchTerm,
  onSearchChange,
  onRemindersClick,
  onSettingsClick,
  todaysStats
}: CalendarLayoutProps) {
  const isMobile = useIsMobile();
  const deviceType = useDeviceType();
  
  return (
    <div className="h-full flex bg-background">
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && (
        <CalendarSidebar
          isCollapsed={isSidebarCollapsed}
          currentDate={currentDate}
          onDateChange={onDateChange}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onToggle={onSidebarToggle}
          todaysStats={todaysStats}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <CalendarHeader
          view={view}
          onViewChange={onViewChange}
          currentDate={currentDate}
          onDateChange={onDateChange}
          onCreateAppointment={onCreateAppointment}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onRemindersClick={onRemindersClick}
          onSettingsClick={onSettingsClick}
          isMobile={isMobile}
        />
        
        {/* Calendar Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}