import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Bell,
  Settings
} from "lucide-react";


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
  onSettingsClick
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
      <div className="px-6 py-4">
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
      </div>
    </div>
  );
}