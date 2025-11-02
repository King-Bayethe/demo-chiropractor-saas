import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PatientFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
  insuranceCount: number;
  selfPayCount: number;
}

export function PatientFilters({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  totalCount,
  filteredCount,
  insuranceCount,
  selfPayCount,
}: PatientFiltersProps) {
  const isMobile = useIsMobile();

  return (
    <Card className="border border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
      <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="text-muted-foreground w-5 h-5" />
            </div>
            <Input 
              placeholder={isMobile ? "Search patients..." : "Search by name, phone, or email..."} 
              className="pl-11 h-12 text-base bg-background border-2 focus:border-primary"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className={cn("flex gap-2", isMobile ? "flex-col" : "flex-wrap")}>
            <Select value={selectedType} onValueChange={onTypeChange}>
              <SelectTrigger className={cn(isMobile ? "text-sm" : "w-44")}>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Private Insurance">Private Insurance</SelectItem>
                <SelectItem value="Medicare">Medicare/Medicaid</SelectItem>
                <SelectItem value="Self-Pay">Self-Pay (Cash)</SelectItem>
                <SelectItem value="Payment Plan">Payment Plan</SelectItem>
                <SelectItem value="Workers Compensation">Workers Comp</SelectItem>
                <SelectItem value="PIP">Auto Insurance (PIP)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className={cn(isMobile ? "text-sm" : "w-32")}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={cn("flex flex-wrap gap-2 pt-2 border-t", isMobile ? "justify-center" : "")}>
            <Badge variant="secondary" className="px-3 py-1.5 text-sm font-semibold">
              <Users className="mr-2 h-4 w-4" />
              Total: {totalCount}
            </Badge>
            <Badge className="px-3 py-1.5 text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-0">
              Insurance: {insuranceCount}
            </Badge>
            <Badge className="px-3 py-1.5 text-sm font-semibold bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-0">
              Self-Pay: {selfPayCount}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
