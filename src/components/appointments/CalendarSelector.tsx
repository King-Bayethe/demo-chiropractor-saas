import React, { useState } from 'react';
import { Check, ChevronsUpDown, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Calendar } from '@/hooks/useCalendars';

interface CalendarSelectorProps {
  calendars: Calendar[];
  selectedCalendarId?: string;
  onCalendarSelect: (calendarId: string) => void;
  placeholder?: string;
}

export const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  calendars,
  selectedCalendarId,
  onCalendarSelect,
  placeholder = "Select a calendar"
}) => {
  const [open, setOpen] = useState(false);

  const selectedCalendar = calendars.find(calendar => calendar.id === selectedCalendarId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-11 justify-between bg-background",
            !selectedCalendarId && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {selectedCalendar ? selectedCalendar.name : placeholder}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search calendars..." 
            className="h-11"
          />
          <CommandList>
            <CommandEmpty>No calendar found.</CommandEmpty>
            <CommandGroup>
              {calendars.map((calendar) => (
                <CommandItem
                  key={calendar.id}
                  value={calendar.name}
                  onSelect={() => {
                    onCalendarSelect(calendar.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 p-3"
                >
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{calendar.name}</div>
                    {calendar.description && (
                      <div className="text-sm text-muted-foreground">{calendar.description}</div>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      calendar.id === selectedCalendarId
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};