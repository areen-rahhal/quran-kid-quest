import { Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProgressTrackerProps {
  completed: number;
  total: number;
}

export const ProgressTracker = ({ completed, total }: ProgressTrackerProps) => {
  const percentage = (completed / total) * 100;
  
  return (
    <div className="bg-card rounded-2xl p-6 mb-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Your Progress</p>
          <p className="text-xl font-bold text-foreground">
            {completed}/{total} Units Completed
          </p>
        </div>
        <div className="relative">
          <Trophy className="w-12 h-12 text-accent animate-pulse-soft" />
        </div>
      </div>
      
      <div className="relative">
        <Progress value={percentage} className="h-3" />
        <div className="mt-2 text-center">
          <span className="text-sm font-semibold text-primary">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
};
