import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, Calendar, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, subMonths, subYears } from "date-fns";

interface SOAPNoteSearchProps {
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
  searchQuery: string;
  filters: SearchFilters;
  totalNotes: number;
  filteredNotes: number;
}

export interface SearchFilters {
  dateRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  provider?: string;
  status?: 'draft' | 'complete' | 'all';
  hasChiefComplaint?: boolean;
}

export function SOAPNoteSearch({ 
  onSearchChange, 
  onFilterChange, 
  searchQuery, 
  filters,
  totalNotes,
  filteredNotes
}: SOAPNoteSearchProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localQuery);
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    onSearchChange('');
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({
      dateRange: 'all',
      status: 'all'
    });
  };

  const hasActiveFilters = 
    filters.dateRange !== 'all' || 
    filters.status !== 'all' || 
    filters.provider || 
    filters.hasChiefComplaint;

  const getDateRangeLabel = (range?: string) => {
    switch (range) {
      case 'week': return 'Last 7 days';
      case 'month': return 'Last 30 days';
      case 'quarter': return 'Last 3 months';
      case 'year': return 'Last year';
      default: return 'All time';
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search SOAP notes by chief complaint, provider, or content..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-7 w-7 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 px-2 ${hasActiveFilters ? 'text-primary' : ''}`}
              >
                <Filter className="w-3 h-3" />
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    !
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                </div>
                
                {/* Date Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date Range
                  </label>
                  <Select 
                    value={filters.dateRange || 'all'} 
                    onValueChange={(value) => handleFilterChange('dateRange', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">Last 30 days</SelectItem>
                      <SelectItem value="quarter">Last 3 months</SelectItem>
                      <SelectItem value="year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={filters.status || 'all'} 
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All notes</SelectItem>
                      <SelectItem value="complete">Complete only</SelectItem>
                      <SelectItem value="draft">Drafts only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </form>

      {/* Active Filters and Results */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2 flex-wrap">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              <Search className="w-3 h-3" />
              "{searchQuery}"
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
          
          {filters.dateRange && filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="w-3 h-3" />
              {getDateRangeLabel(filters.dateRange)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange('dateRange', 'all')}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
          
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.status === 'draft' ? 'Drafts' : 'Complete'}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange('status', 'all')}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
        </div>
        
        <div>
          Showing {filteredNotes} of {totalNotes} notes
        </div>
      </div>
    </div>
  );
}