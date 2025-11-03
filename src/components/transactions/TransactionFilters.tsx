import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Download } from "lucide-react";
import { TransactionFilters as Filters } from "@/hooks/useTransactions";

interface TransactionFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onDatePreset: (preset: 'today' | 'week' | 'month' | 'quarter' | 'year') => void;
  onExport: () => void;
}

export const TransactionFilters = ({ filters, onFilterChange, onDatePreset, onExport }: TransactionFiltersProps) => {
  const typeOptions = ['payment', 'refund', 'adjustment', 'fee'];
  const paymentMethodOptions = ['cash', 'credit_card', 'debit_card', 'check', 'ach', 'insurance'];

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.type.includes(type)
      ? filters.type.filter(t => t !== type)
      : [...filters.type, type];
    onFilterChange({ ...filters, type: newTypes });
  };

  const handlePaymentMethodToggle = (method: string) => {
    const newMethods = filters.paymentMethod.includes(method)
      ? filters.paymentMethod.filter(m => m !== method)
      : [...filters.paymentMethod, method];
    onFilterChange({ ...filters, paymentMethod: newMethods });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      type: [],
      paymentMethod: [],
      dateRange: undefined,
      amountRange: undefined,
      patientIds: [],
    });
  };

  const hasActiveFilters = filters.search || filters.type.length > 0 || filters.paymentMethod.length > 0 || filters.dateRange || filters.amountRange;

  return (
    <Card className="border border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-6 space-y-4">
        {/* Search and Export */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by transaction ID, patient, or description..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Date Presets */}
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Date Range</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onDatePreset('today')}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDatePreset('week')}>
              This Week
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDatePreset('month')}>
              This Month
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDatePreset('quarter')}>
              This Quarter
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDatePreset('year')}>
              This Year
            </Button>
          </div>
        </div>

        {/* Type Filters */}
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Transaction Type</p>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map(type => (
              <Badge
                key={type}
                variant={filters.type.includes(type) ? "default" : "outline"}
                className="cursor-pointer transition-colors capitalize"
                onClick={() => handleTypeToggle(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Payment Method Filters */}
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Payment Method</p>
          <div className="flex flex-wrap gap-2">
            {paymentMethodOptions.map(method => (
              <Badge
                key={method}
                variant={filters.paymentMethod.includes(method) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => handlePaymentMethodToggle(method)}
              >
                {method.replace('_', ' ')}
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
              onClick={() => onFilterChange({ ...filters, type: ['refund'] })}
            >
              Refunds Only
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFilterChange({ ...filters, amountRange: { min: 500 } })}
            >
              Large Transactions (&gt;$500)
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
