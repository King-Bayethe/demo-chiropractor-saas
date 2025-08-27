import { ReactNode } from "react";
import { CalendarSidebar } from "./CalendarSidebar";
import { CalendarHeader } from "./CalendarHeader";

interface CalendarLayoutProps {
  children: ReactNode;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onCreateAppointment: () => void;
  filters: {
    providers: string[];
    status: string[];
    types: string[];
  };
  onFiltersChange: (filters: any) => void;
  isSidebarCollapsed: boolean;
  onSidebarToggle: () => void;
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
  onSidebarToggle
}: CalendarLayoutProps) {
  return (
    <div className="h-full flex bg-background">
      {/* Sidebar */}
      <CalendarSidebar
        isCollapsed={isSidebarCollapsed}
        currentDate={currentDate}
        onDateChange={onDateChange}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onToggle={onSidebarToggle}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <CalendarHeader
          view={view}
          onViewChange={onViewChange}
          currentDate={currentDate}
          onDateChange={onDateChange}
          onCreateAppointment={onCreateAppointment}
        />
        
        {/* Calendar Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}