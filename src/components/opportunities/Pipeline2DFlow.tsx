import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PipelineStage {
  id: string;
  title: string;
  color: string;
  count: number;
}

interface Pipeline2DFlowProps {
  stages: PipelineStage[];
  onStageClick?: (stageId: string) => void;
  className?: string;
}

// Custom node component for pipeline stages
const StageNode = ({ data }: { data: any }) => {
  return (
    <div 
      className={cn(
        "relative flex flex-col items-center justify-center min-w-[120px] min-h-[80px] rounded-lg border-2 bg-background shadow-lg cursor-pointer transition-all duration-200 hover:scale-105",
        data.color
      )}
      onClick={() => data.onStageClick?.(data.stageId)}
    >
      <div className="text-sm font-semibold text-center px-2 mb-1">
        {data.title}
      </div>
      <div className="text-2xl font-bold text-foreground">
        {data.count}
      </div>
    </div>
  );
};

const nodeTypes = {
  stageNode: StageNode,
};

export function Pipeline2DFlow({ stages, onStageClick, className }: Pipeline2DFlowProps) {
  // Create nodes from stages
  const initialNodes: Node[] = useMemo(() => {
    return stages.map((stage, index) => ({
      id: stage.id,
      type: 'stageNode',
      position: { x: index * 200, y: 100 },
      data: {
        title: stage.title,
        count: stage.count,
        color: stage.color,
        stageId: stage.id,
        onStageClick,
      },
      draggable: false,
    }));
  }, [stages, onStageClick]);

  // Create edges between stages
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    for (let i = 0; i < stages.length - 1; i++) {
      edges.push({
        id: `e${stages[i].id}-${stages[i + 1].id}`,
        source: stages[i].id,
        target: stages[i + 1].id,
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: 'hsl(var(--muted-foreground))', 
          strokeWidth: 2 
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--muted-foreground))',
        },
      });
    }
    return edges;
  }, [stages]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when stages change
  React.useEffect(() => {
    const updatedNodes = stages.map((stage, index) => ({
      id: stage.id,
      type: 'stageNode',
      position: { x: index * 200, y: 100 },
      data: {
        title: stage.title,
        count: stage.count,
        color: stage.color,
        stageId: stage.id,
        onStageClick,
      },
      draggable: false,
    }));
    // Use setNodes directly instead of onNodesChange with reset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages, onStageClick]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.data && typeof node.data === 'object' && 'onStageClick' in node.data && typeof node.data.onStageClick === 'function') {
      node.data.onStageClick(node.data.stageId);
    }
  }, []);

  return (
    <Card className={cn("border-0 shadow-none bg-muted/20", className)}>
      <div className="h-[300px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          style={{ backgroundColor: 'transparent' }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background 
            color="hsl(var(--muted-foreground))" 
            gap={20} 
            size={1}
            style={{ opacity: 0.1 }}
          />
          <Controls 
            showZoom={true}
            showFitView={true}
            showInteractive={false}
            style={{
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
            }}
          />
          <MiniMap 
            style={{
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
            }}
            maskColor="hsl(var(--muted) / 0.8)"
          />
        </ReactFlow>
      </div>
    </Card>
  );
}