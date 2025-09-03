import { ReactNode } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarFilters } from "./CalendarFilters";
import { TodaysOverview } from "./TodaysOverview";
import { useIsMobile, useIsTablet, useDeviceType } from "@/hooks/use-breakpoints";
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
  deviceType?: 'mobile' | 'tablet' | 'desktop';
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
  searchTerm,
  onSearchChange,
  onRemindersClick,
  onSettingsClick,
  todaysStats
}: CalendarLayoutProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const deviceType = useDeviceType();
  
  return (
    <div className="h-full flex flex-col bg-background">
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
          filters={filters}
          onFiltersChange={onFiltersChange}
          todaysStats={todaysStats}
          isMobile={isMobile}
          isTablet={isTablet}
          deviceType={deviceType}
        />
        
        {/* Calendar Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        
        {/* Filters and Today's Overview */}
        <div className={cn(
          "border-t border-border bg-background p-4",
          isMobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 lg:grid-cols-2 gap-6"
        )}>
          <CalendarFilters filters={filters} onFiltersChange={onFiltersChange} />
          <TodaysOverview todaysStats={todaysStats} />
        </div>
      </div>
    </div>
  );
}