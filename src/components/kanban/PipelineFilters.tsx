import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface PipelineFiltersProps {
  search: string;
  priority: string;
  valueRange: string;
  onSearchChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onValueRangeChange: (value: string) => void;
}

export function PipelineFilters({
  search,
  priority,
  valueRange,
  onSearchChange,
  onPriorityChange,
  onValueRangeChange,
}: PipelineFiltersProps) {
  return (
    <Card className="mb-6 border-2">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search opportunities..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">
              Priority
            </Label>
            <Select value={priority} onValueChange={onPriorityChange}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value-range" className="text-sm font-medium">
              Value Range
            </Label>
            <Select value={valueRange} onValueChange={onValueRangeChange}>
              <SelectTrigger id="value-range">
                <SelectValue placeholder="All values" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Values</SelectItem>
                <SelectItem value="0-1000">$0 - $1,000</SelectItem>
                <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                <SelectItem value="10000+">$10,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
