import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DayPickerSingleProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type EnhancedCalendarProps = DayPickerSingleProps & {
  className?: string;
}

function EnhancedCalendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: EnhancedCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    props.selected || props.defaultMonth || new Date()
  );

  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  // Generate year options (100 years back from current year for birth dates)
  const yearOptions = React.useMemo(() => {
    const years = [];
    const endYear = new Date().getFullYear();
    const startYear = endYear - 120; // 120 years back for birth dates
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }
    return years;
  }, []);

  const monthOptions = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  const handleYearChange = (yearString: string) => {
    const newYear = parseInt(yearString);
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newYear);
    setCurrentMonth(newDate);
  };

  const handleMonthChange = (monthString: string) => {
    const newMonth = parseInt(monthString);
    const newDate = new Date(currentMonth);
    newDate.setMonth(newMonth);
    setCurrentMonth(newDate);
  };

  return (
    <div className={cn("p-3 pointer-events-auto", className)}>
      {/* Year and Month Selectors */}
      <div className="flex items-center justify-between space-x-2 mb-4">
        <div className="flex space-x-2">
          <Select value={currentMonthIndex.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={currentYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DayPicker
        mode="single"
        showOutsideDays={showOutsideDays}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        className={cn("p-0", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
    </div>
  )
}
EnhancedCalendar.displayName = "EnhancedCalendar"

export { EnhancedCalendar }