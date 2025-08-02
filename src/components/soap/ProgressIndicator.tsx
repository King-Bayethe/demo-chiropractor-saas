import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";

interface ProgressIndicatorProps {
  percentage: number;
  sectionsComplete: {
    subjective: boolean;
    objective: boolean;
    assessment: boolean;
    plan: boolean;
  };
}

export function ProgressIndicator({ percentage, sectionsComplete }: ProgressIndicatorProps) {
  const getProgressColor = () => {
    if (percentage === 100) return "bg-progress-complete";
    if (percentage >= 50) return "bg-progress-partial";
    return "bg-progress-incomplete";
  };

  const getSectionIcon = (isComplete: boolean) => {
    if (isComplete) return <CheckCircle className="w-4 h-4 text-indicator-normal" />;
    return <Clock className="w-4 h-4 text-indicator-pending" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Note Completion</span>
            <span className="text-muted-foreground">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
        <Badge 
          variant={percentage === 100 ? "default" : "secondary"}
          className={percentage === 100 ? "bg-medical-green text-white" : ""}
        >
          {percentage === 100 ? "Complete" : `${percentage}%`}
        </Badge>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(sectionsComplete).map(([section, isComplete]) => (
          <div key={section} className="flex items-center space-x-2 text-xs">
            {getSectionIcon(isComplete)}
            <span className={`capitalize ${isComplete ? 'text-indicator-normal' : 'text-muted-foreground'}`}>
              {section.substring(0, 4)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}