import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Copy, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { usePipelines, usePipelineStages, type Pipeline } from '@/hooks/usePipelines';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PipelineCardProps {
  pipeline: Pipeline;
  onEdit: () => void;
}

export function PipelineCard({ pipeline, onEdit }: PipelineCardProps) {
  const { deletePipeline, setDefaultPipeline, duplicatePipeline } = usePipelines();
  const { stages } = usePipelineStages(pipeline.id);
  const [opportunityCount, setOpportunityCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('opportunities')
        .select('estimated_value')
        .eq('pipeline_id', pipeline.id);

      if (data) {
        setOpportunityCount(data.length);
        setTotalValue(data.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0));
      }
    };

    fetchStats();
  }, [pipeline.id]);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${pipeline.name}"?`)) {
      await deletePipeline(pipeline.id);
    }
  };

  const handleDuplicate = async () => {
    const newName = prompt('Enter name for duplicated pipeline:', `${pipeline.name} (Copy)`);
    if (newName) {
      await duplicatePipeline(pipeline.id, newName);
    }
  };

  const handleSetDefault = async () => {
    await setDefaultPipeline(pipeline.id);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg truncate">{pipeline.name}</h3>
                {pipeline.is_default && (
                  <Badge variant="secondary" className="flex-shrink-0">
                    <Star className="h-3 w-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
              {pipeline.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {pipeline.description}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Pipeline
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              {!pipeline.is_default && (
                <DropdownMenuItem onClick={handleSetDefault}>
                  <Star className="mr-2 h-4 w-4" />
                  Set as Default
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive"
                disabled={pipeline.is_default}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stages.length}</div>
            <div className="text-xs text-muted-foreground">Stages</div>
          </div>
          <div className="text-center border-x">
            <div className="text-2xl font-bold text-foreground">{opportunityCount}</div>
            <div className="text-xs text-muted-foreground">Opportunities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              ${(totalValue / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-muted-foreground">Total Value</div>
          </div>
        </div>

        {/* Stage Preview */}
        {stages.length > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Pipeline Stages
            </div>
            <div className="flex flex-wrap gap-1.5">
              {stages.slice(0, 5).map((stage) => (
                <Badge
                  key={stage.id}
                  variant="secondary"
                  className="text-xs"
                >
                  <div className={cn("h-2 w-2 rounded-full mr-1.5", stage.color)} />
                  {stage.name}
                </Badge>
              ))}
              {stages.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{stages.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
