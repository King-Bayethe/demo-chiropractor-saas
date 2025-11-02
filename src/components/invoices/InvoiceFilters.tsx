import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import { InvoiceFilters as InvoiceFiltersType } from "@/hooks/useInvoices";

interface InvoiceFiltersProps {
  filters: InvoiceFiltersType;
  onFilterChange: (filters: InvoiceFiltersType) => void;
}

export const InvoiceFilters = ({ filters, onFilterChange }: InvoiceFiltersProps) => {
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFilterChange({ ...filters, status: newStatus });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: [],
      patientIds: [],
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status.length > 0 ||
    filters.patientIds.length > 0;

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
            placeholder="Search invoices, patients..."
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

        {/* Quick Filters */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Quick Filters</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFilterChange({ ...filters, status: ['sent', 'overdue'] })}
            >
              Unpaid
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                onFilterChange({
                  ...filters,
                  status: ['sent', 'overdue'],
                  dateTo: today,
                });
              }}
            >
              Overdue
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                onFilterChange({
                  ...filters,
                  dateFrom: firstDay,
                  dateTo: now,
                });
              }}
            >
              This Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                onFilterChange({
                  ...filters,
                  dateFrom: firstDay,
                  dateTo: lastDay,
                });
              }}
            >
              This Quarter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
