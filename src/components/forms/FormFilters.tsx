import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar } from "lucide-react";
import { FormFilters as FormFiltersType } from "@/hooks/useFormSubmissions";
import { Button } from "@/components/ui/button";

interface FormFiltersProps {
  filters: FormFiltersType;
  onFiltersChange: (filters: FormFiltersType) => void;
}

export const FormFilters = ({ filters, onFiltersChange }: FormFiltersProps) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleFormTypeChange = (value: string) => {
    onFiltersChange({ ...filters, formType: value === 'all' ? undefined : value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value === 'all' ? undefined : value });
  };

  const handleQuickFilter = (days: number) => {
    const now = new Date();
    const dateFrom = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    onFiltersChange({ ...filters, dateFrom, dateTo: undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or email..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filters.formType || 'all'} onValueChange={handleFormTypeChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Form Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Forms</SelectItem>
            <SelectItem value="pip">PIP Form</SelectItem>
            <SelectItem value="lop">LOP Form</SelectItem>
            <SelectItem value="cash">Cash Form</SelectItem>
            <SelectItem value="new">New Patient</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter(7)}
          className="text-xs"
        >
          <Calendar className="h-3 w-3 mr-1" />
          Last 7 Days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter(30)}
          className="text-xs"
        >
          <Calendar className="h-3 w-3 mr-1" />
          Last 30 Days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter(90)}
          className="text-xs"
        >
          <Calendar className="h-3 w-3 mr-1" />
          Last 90 Days
        </Button>
        {(filters.search || filters.formType || filters.status || filters.dateFrom) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};
