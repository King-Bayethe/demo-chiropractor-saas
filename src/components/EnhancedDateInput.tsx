import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parse, isValid, differenceInYears } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface EnhancedDateInputProps {
  label?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  showAge?: boolean;
  maxDate?: Date;
  minDate?: Date;
}

export function EnhancedDateInput({
  label,
  value,
  onChange,
  placeholder = "MM/DD/YYYY",
  className,
  error,
  showAge = false,
  maxDate,
  minDate
}: EnhancedDateInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Update input value when prop value changes
  useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, "MM/dd/yyyy"));
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Allow only numbers and slashes, auto-format as user types
    let formattedValue = rawValue.replace(/[^\d/]/g, '');
    
    // Auto-add slashes
    if (formattedValue.length >= 2 && formattedValue.indexOf('/') === -1) {
      formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
    }
    if (formattedValue.length >= 5 && formattedValue.lastIndexOf('/') === 2) {
      formattedValue = formattedValue.slice(0, 5) + '/' + formattedValue.slice(5);
    }
    
    // Limit to 10 characters (MM/DD/YYYY)
    formattedValue = formattedValue.slice(0, 10);
    
    setInputValue(formattedValue);
    
    // Try to parse the date if it looks complete
    if (formattedValue.length === 10) {
      try {
        const parsedDate = parse(formattedValue, "MM/dd/yyyy", new Date());
        if (isValid(parsedDate)) {
          // Validate against min/max dates
          if (minDate && parsedDate < minDate) return;
          if (maxDate && parsedDate > maxDate) return;
          
          onChange(parsedDate);
        } else {
          onChange(undefined);
        }
      } catch {
        onChange(undefined);
      }
    } else if (formattedValue === "") {
      onChange(undefined);
    }
  };

  const handleInputBlur = () => {
    // Clean up incomplete dates on blur
    if (inputValue.length > 0 && inputValue.length < 10) {
      setInputValue(value ? format(value, "MM/dd/yyyy") : "");
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    onChange(date);
    setCalendarOpen(false);
  };

  const calculateAge = (birthDate: Date) => {
    if (!birthDate || !isValid(birthDate)) return null;
    const age = differenceInYears(new Date(), birthDate);
    return age >= 0 ? age : null;
  };

  const age = value ? calculateAge(value) : null;

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className={cn(error && "border-destructive")}
            maxLength={10}
          />
          {error && (
            <p className="text-sm text-destructive mt-1">{error}</p>
          )}
        </div>
        
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="px-3"
              type="button"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {showAge && age !== null && (
        <p className="text-sm text-muted-foreground">
          Age: {age} year{age !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}