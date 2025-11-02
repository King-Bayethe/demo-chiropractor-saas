import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import { TaskFilters as TaskFiltersType } from "@/hooks/useTasks";

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFilterChange: (filters: TaskFiltersType) => void;
}

export const TaskFilters = ({ filters, onFilterChange }: TaskFiltersProps) => {
  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFilterChange({ ...filters, status: newStatus });
  };

  const handlePriorityToggle = (priority: string) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    onFilterChange({ ...filters, priority: newPriority });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      assignees: [],
      status: [],
      priority: [],
      tags: [],
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.status.length > 0 || 
    filters.priority.length > 0 ||
    filters.assignees.length > 0 ||
    filters.tags.length > 0;

  return (
    <Card className="border border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Filters</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isSelected = filters.status.includes(option.value);
              return (
                <Badge
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleStatusToggle(option.value)}
                >
                  {option.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Priority</label>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((option) => {
              const isSelected = filters.priority.includes(option.value);
              return (
                <Badge
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handlePriorityToggle(option.value)}
                >
                  {option.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Quick Filters</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const overdue = new Date(today);
                overdue.setDate(today.getDate() - 1);
                onFilterChange({
                  ...filters,
                  status: ['todo', 'in_progress', 'blocked'],
                  dueDateTo: overdue,
                });
              }}
            >
              Overdue
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
                onFilterChange({
                  ...filters,
                  status: ['todo', 'in_progress', 'blocked'],
                  dueDateFrom: startOfDay,
                  dueDateTo: endOfDay,
                });
              }}
            >
              Due Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const weekFromNow = new Date(today);
                weekFromNow.setDate(today.getDate() + 7);
                onFilterChange({
                  ...filters,
                  status: ['todo', 'in_progress', 'blocked'],
                  dueDateFrom: today,
                  dueDateTo: weekFromNow,
                });
              }}
            >
              This Week
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
