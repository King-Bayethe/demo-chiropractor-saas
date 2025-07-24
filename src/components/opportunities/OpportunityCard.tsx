import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail, DollarSign, Calendar, GripVertical, MoreHorizontal } from "lucide-react";
import { Opportunity } from "@/pages/Opportunities";
import { cn } from "@/lib/utils";

interface OpportunityCardProps {
  opportunity: Opportunity;
  isDragging?: boolean;
}

export function OpportunityCard({ opportunity, isDragging = false }: OpportunityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No activity";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all hover:shadow-md",
        (isDragging || isSortableDragging) && "opacity-50 shadow-lg rotate-2 scale-105"
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(opportunity.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{opportunity.name}</h4>
                {opportunity.assignedTo && (
                  <p className="text-xs text-muted-foreground truncate">
                    Assigned to {opportunity.assignedTo}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                {...listeners}
              >
                <GripVertical className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Value */}
          {opportunity.monetaryValue && opportunity.monetaryValue > 0 && (
            <div className="flex items-center space-x-1 text-green-600">
              <DollarSign className="h-3 w-3" />
              <span className="text-sm font-medium">
                ${opportunity.monetaryValue.toLocaleString()}
              </span>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-1">
            {opportunity.contact?.phone && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span className="truncate">{opportunity.contact.phone}</span>
              </div>
            )}
            {opportunity.contact?.email && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{opportunity.contact.email}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {opportunity.tags && opportunity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {opportunity.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {opportunity.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{opportunity.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Source */}
          {opportunity.source && (
            <div className="text-xs text-muted-foreground">
              Source: {opportunity.source}
            </div>
          )}

          {/* Last Activity */}
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Last activity: {formatDate(opportunity.lastActivity)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}