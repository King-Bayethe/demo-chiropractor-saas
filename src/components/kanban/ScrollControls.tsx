import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollControlsProps {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

export function ScrollControls({
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
}: ScrollControlsProps) {
  return (
    <>
      {canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          onClick={onScrollLeft}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-10",
            "bg-background/95 backdrop-blur-sm shadow-lg",
            "hover:bg-accent border-2"
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      
      {canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          onClick={onScrollRight}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-10",
            "bg-background/95 backdrop-blur-sm shadow-lg",
            "hover:bg-accent border-2"
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
