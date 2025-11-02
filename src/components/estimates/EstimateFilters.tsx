import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EstimateFilters as EstimateFiltersType } from "@/hooks/useEstimates";
import { Search, X } from "lucide-react";

interface EstimateFiltersProps {
  filters: EstimateFiltersType;
  onFiltersChange: (filters: EstimateFiltersType) => void;
}

const statusOptions = ['draft', 'sent', 'accepted', 'rejected', 'expired'];

export function EstimateFilters({ filters, onFiltersChange }: EstimateFiltersProps) {
  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handleReset = () => {
    onFiltersChange({
      search: '',
      status: [],
      treatmentType: [],
    });
  };

  const hasActiveFilters = filters.search || filters.status.length > 0;

  return (
    <Card className="border border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-4 md:p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search estimates, patients, treatment types..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <Badge
                key={status}
                variant={filters.status.includes(status) ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => handleStatusToggle(status)}
              >
                {status}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Quick Filters</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, status: ['sent'] })}
            >
              Pending
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const thisMonth = new Date();
                thisMonth.setDate(1);
                thisMonth.setHours(0, 0, 0, 0);
                onFiltersChange({ 
                  ...filters, 
                  status: ['accepted'],
                  dateFrom: thisMonth 
                });
              }}
            >
              Accepted This Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const sevenDaysFromNow = new Date();
                sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
                onFiltersChange({ 
                  ...filters,
                  status: ['sent']
                });
              }}
            >
              Expiring Soon
            </Button>
          </div>
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
