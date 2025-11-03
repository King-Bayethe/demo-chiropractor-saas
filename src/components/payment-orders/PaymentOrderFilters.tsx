import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Calendar } from "lucide-react";
import { PaymentOrderFilters as Filters } from "@/hooks/usePaymentOrders";

interface PaymentOrderFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export const PaymentOrderFilters = ({ filters, onFilterChange }: PaymentOrderFiltersProps) => {
  const statusOptions = ['active', 'paused', 'completed', 'cancelled', 'failed'];
  const frequencyOptions = ['weekly', 'bi-weekly', 'monthly', 'custom'];

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFilterChange({ ...filters, status: newStatus });
  };

  const handleFrequencyToggle = (frequency: string) => {
    const newFrequency = filters.frequency.includes(frequency)
      ? filters.frequency.filter(f => f !== frequency)
      : [...filters.frequency, frequency];
    onFilterChange({ ...filters, frequency: newFrequency });
  };

  const handleQuickFilter = (type: 'week' | 'failed' | 'active') => {
    if (type === 'week') {
      const today = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(today.getDate() + 7);
      onFilterChange({ ...filters, dateRange: { from: today, to: weekFromNow } });
    } else if (type === 'failed') {
      onFilterChange({ ...filters, status: ['failed'] });
    } else if (type === 'active') {
      onFilterChange({ ...filters, status: ['active'] });
    }
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: [],
      frequency: [],
      dateRange: undefined,
    });
  };

  const hasActiveFilters = filters.search || filters.status.length > 0 || filters.frequency.length > 0 || filters.dateRange;

  return (
    <Card className="border border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or description..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Status Filters */}
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Status</p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(status => (
              <Badge
                key={status}
                variant={filters.status.includes(status) ? "default" : "outline"}
                className="cursor-pointer transition-colors capitalize"
                onClick={() => handleStatusToggle(status)}
              >
                {status}
              </Badge>
            ))}
          </div>
        </div>

        {/* Frequency Filters */}
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Frequency</p>
          <div className="flex flex-wrap gap-2">
            {frequencyOptions.map(frequency => (
              <Badge
                key={frequency}
                variant={filters.frequency.includes(frequency) ? "default" : "outline"}
                className="cursor-pointer transition-colors capitalize"
                onClick={() => handleFrequencyToggle(frequency)}
              >
                {frequency}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Quick Filters</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('week')}
              className="text-xs"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Due This Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('failed')}
              className="text-xs"
            >
              Failed Payments
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('active')}
              className="text-xs"
            >
              Active Plans
            </Button>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
