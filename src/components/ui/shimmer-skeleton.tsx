import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ShimmerSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar skeleton */}
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-muted to-muted/50 animate-shimmer" />
              
              <div className="flex-1 space-y-3">
                {/* Name skeleton */}
                <div className="h-5 bg-gradient-to-r from-muted via-muted/80 to-muted rounded w-2/3 animate-shimmer" />
                {/* ID skeleton */}
                <div className="h-3 bg-gradient-to-r from-muted via-muted/80 to-muted rounded w-24 animate-shimmer" />
                {/* Badge skeleton */}
                <div className="h-6 bg-gradient-to-r from-muted via-muted/80 to-muted rounded-full w-28 animate-shimmer" />
              </div>
            </div>
            
            {/* Contact info skeletons */}
            <div className="space-y-2.5 mb-4 border-t pt-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-muted animate-shimmer" />
                <div className="h-4 bg-muted rounded w-32 animate-shimmer" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-muted animate-shimmer" />
                <div className="h-4 bg-muted rounded w-48 animate-shimmer" />
              </div>
            </div>
            
            {/* Stats row skeleton */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="text-center space-y-2">
                  <div className="h-3 bg-muted rounded mx-auto w-16 animate-shimmer" />
                  <div className="h-4 bg-muted/80 rounded mx-auto w-12 animate-shimmer" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableShimmerSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-muted animate-shimmer" />
          
          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-1/4 animate-shimmer" />
            <div className="h-3 bg-muted/80 rounded w-1/6 animate-shimmer" />
          </div>
          
          {/* Badge */}
          <div className="h-6 w-24 bg-muted rounded-full animate-shimmer" />
          
          {/* Stats */}
          <div className="hidden md:block">
            <div className="h-4 bg-muted rounded w-20 animate-shimmer" />
          </div>
          
          {/* Actions */}
          <div className="h-8 w-8 bg-muted rounded animate-shimmer" />
        </div>
      ))}
    </div>
  );
}
