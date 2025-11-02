import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface SOAPFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  thisMonthCount: number;
}

export function SOAPFilters({
  searchTerm,
  onSearchChange,
  totalCount,
  thisMonthCount,
}: SOAPFiltersProps) {
  const isMobile = useIsMobile();

  return (
    <Card className="border border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
      <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
        <div className={cn("flex space-x-3", isMobile ? "flex-col space-y-3 space-x-0" : "items-center space-x-4")}>
          <div className="relative flex-1">
            <Search className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground",
              isMobile ? "w-3 h-3" : "w-4 h-4"
            )} />
            <Input 
              placeholder={isMobile ? "Search notes..." : "Search by patient name, provider, or chief complaint..."} 
              className={cn(isMobile ? "pl-9 h-9 text-sm" : "pl-10 h-12 text-base bg-background border-2 focus:border-primary")}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          {!isMobile && (
            <>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="px-3 py-1.5">Total: {totalCount}</Badge>
                <Badge variant="outline" className="px-3 py-1.5 bg-primary/10 text-primary border-primary/20">
                  This Month: {thisMonthCount}
                </Badge>
              </div>
            </>
          )}
          
          {isMobile && (
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm">
                <Filter className="w-3 h-3 mr-2" />
                Filters
              </Button>
              <div className="flex space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {totalCount} Notes
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
