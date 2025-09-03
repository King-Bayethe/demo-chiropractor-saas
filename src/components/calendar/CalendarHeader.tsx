import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CalendarFilters } from "./CalendarFilters";
import { TodaysOverview } from "./TodaysOverview";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Bell,
  Settings,
  Menu
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-breakpoints";
import { cn } from "@/lib/utils";


interface CalendarHeaderProps {
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onCreateAppointment: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onRemindersClick?: () => void;
  onSettingsClick?: () => void;
  filters: {
    status: string[];
    types: string[];
  };
  onFiltersChange: (filters: any) => void;
  todaysStats?: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  isMobile?: boolean;
  isTablet?: boolean;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

export function CalendarHeader({
  view,
  onViewChange,
  currentDate,
  onDateChange,
  onCreateAppointment,
  searchTerm = '',
  onSearchChange,
  onRemindersClick,
  onSettingsClick,
  filters,
  onFiltersChange,
  todaysStats,
  isMobile = false,
  isTablet = false,
  deviceType = 'desktop'
}: CalendarHeaderProps) {
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    onDateChange(newDate);
  };

  const getDateRangeText = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={cn("px-3 md:px-6 py-3 md:py-4")}>
        {isMobile ? (
          // Mobile Layout
          <>
            {/* Top Row - Title and Menu */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-medical-blue" />
                <h1 className="text-lg font-bold text-foreground">Calendar</h1>
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Calendar Options</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 mt-6">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={onRemindersClick}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Reminders
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={onSettingsClick}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Navigation and Date */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateDate('prev')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateDate('next')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDateChange(new Date())}
                className="text-medical-blue border-medical-blue/30 hover:bg-medical-blue/5"
              >
                Today
              </Button>
            </div>

            {/* Date Display */}
            <div className="mb-3">
              <h2 className="text-base font-semibold text-foreground text-center">
                {getDateRangeText()}
              </h2>
            </div>

            {/* View Controls */}
            <div className="flex justify-center mb-3">
              <div className="flex rounded-lg border border-border overflow-hidden">
                <Button
                  variant={view === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('month')}
                  className={cn("rounded-none border-0 text-xs px-3", 
                    view === 'month' ? 'bg-medical-blue text-white hover:bg-medical-blue-dark' : 'hover:bg-accent'
                  )}
                >
                  Month
                </Button>
                <Button
                  variant={view === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('week')}
                  className={cn("rounded-none border-0 border-l border-border text-xs px-3",
                    view === 'week' ? 'bg-medical-blue text-white hover:bg-medical-blue-dark' : 'hover:bg-accent'
                  )}
                >
                  Week
                </Button>
                <Button
                  variant={view === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('day')}
                  className={cn("rounded-none border-0 border-l border-border text-xs px-3",
                    view === 'day' ? 'bg-medical-blue text-white hover:bg-medical-blue-dark' : 'hover:bg-accent'
                  )}
                >
                  Day
                </Button>
              </div>
            </div>

            {/* Search and New Appointment */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>
              <Button 
                onClick={onCreateAppointment}
                className="w-full bg-medical-blue hover:bg-medical-blue-dark text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </div>

            {/* Filters and Today's Overview */}
            <div className="grid grid-cols-1 gap-4 mt-4">
              <CalendarFilters filters={filters} onFiltersChange={onFiltersChange} />
              <TodaysOverview todaysStats={todaysStats} />
            </div>
          </>
        ) : isTablet ? (
          // Tablet Layout - Optimized for touch
          <>
            {/* Top Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5 text-medical-blue" />
                  <h1 className="text-xl font-bold text-foreground">Calendar</h1>
                </div>
                <Badge variant="secondary" className="bg-medical-blue/10 text-medical-blue text-xs">
                  Healthcare
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRemindersClick}
                  className="h-9 px-3"
                >
                  <Bell className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Reminders</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onSettingsClick}
                  className="h-9 px-3"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
                <Button 
                  onClick={onCreateAppointment}
                  className="bg-medical-blue hover:bg-medical-blue-dark text-white h-9 px-4"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Button>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between">
              {/* Navigation and Date */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => navigateDate('prev')}
                    className="h-9 w-9 touch-manipulation"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => navigateDate('next')}
                    className="h-9 w-9 touch-manipulation"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <h2 className="text-lg font-semibold text-foreground">
                  {getDateRangeText()}
                </h2>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDateChange(new Date())}
                  className="text-medical-blue border-medical-blue/30 hover:bg-medical-blue/5 h-9 px-3"
                >
                  Today
                </Button>
              </div>

              {/* Search and View Controls */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 w-48 h-9"
                    value={searchTerm}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                  />
                </div>
                
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <Button
                    variant={view === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('month')}
                    className={`rounded-none border-0 h-9 px-3 touch-manipulation ${view === 'month' ? 'bg-medical-blue text-white hover:bg-medical-blue-dark' : 'hover:bg-accent'}`}
                  >
                    Month
                  </Button>
                  <Button
                    variant={view === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('week')}
                    className={`rounded-none border-0 border-l border-border h-9 px-3 touch-manipulation ${view === 'week' ? 'bg-medical-blue text-white hover:bg-medical-blue-dark' : 'hover:bg-accent'}`}
                  >
                    Week
                  </Button>
                  <Button
                    variant={view === 'day' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('day')}
                    className={`rounded-none border-0 border-l border-border h-9 px-3 touch-manipulation ${view === 'day' ? 'bg-medical-blue text-white hover:bg-medical-blue-dark' : 'hover:bg-accent'}`}
                  >
                    Day
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters and Today's Overview for Tablet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <CalendarFilters filters={filters} onFiltersChange={onFiltersChange} />
              <TodaysOverview todaysStats={todaysStats} />
            </div>
          </>
        ) : (
          // Desktop Layout
          <>
            {/* Top Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-6 h-6 text-medical-blue" />
                  <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
                </div>
                <Badge variant="secondary" className="bg-medical-blue/10 text-medical-blue">
                  Healthcare Scheduling
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRemindersClick}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Reminders
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onSettingsClick}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  onClick={onCreateAppointment}
                  className="bg-medical-blue hover:bg-medical-blue-dark text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between">
              {/* Navigation and Date */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => navigateDate('prev')}
                    className="h-9 w-9"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => navigateDate('next')}
                    className="h-9 w-9"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <h2 className="text-xl font-semibold text-foreground min-w-[200px]">
                  {getDateRangeText()}
                </h2>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDateChange(new Date())}
                  className="text-medical-blue border-medical-blue/30 hover:bg-medical-blue/5"
                >
                  Today
                </Button>
              </div>

              {/* Search and View Controls */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search appointments..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                  />
                </div>
                
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <Button
                    variant={view === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('month')}
                    className={`rounded-none border-0 ${view === 'month' ? 'bg-medical-blue text-white hover:bg-medical-blue-dark' : 'hover:bg-accent'}`}
                  >
                    Month
                  </Button>
                  <Button
                    variant={view === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('week')}
                    className={`rounded-none border-0 border-l border-border ${view === 'week' ? 'bg-medical-blue text-white hover:bg-medical-blue-dark' : 'hover:bg-accent'}`}
                  >
                    Week
                  </Button>
                  <Button
                    variant={view === 'day' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('day')}
                    className={`rounded-none border-0 border-l border-border ${view === 'day' ? 'bg-medical-blue text-white hover:bg-medical-blue-dark' : 'hover:bg-accent'}`}
                  >
                    Day
                  </Button>
                </div>

                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filters and Today's Overview for Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <CalendarFilters filters={filters} onFiltersChange={onFiltersChange} />
              <TodaysOverview todaysStats={todaysStats} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}