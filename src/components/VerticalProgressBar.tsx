import { Trophy } from "lucide-react";

interface VerticalProgressBarProps {
  completed: number;
  total: number;
}

export const VerticalProgressBar = ({ completed, total }: VerticalProgressBarProps) => {
  const percentage = (completed / total) * 100;
  
  return (
    <div className="fixed left-6 top-6 bottom-6 flex flex-col items-center z-10">
      {/* Trophy at top */}
      <Trophy className="w-8 h-8 text-accent mb-3" />
      
      {/* Vertical progress bar container */}
      <div className="relative w-3 flex-1 bg-secondary/30 rounded-full overflow-hidden">
        {/* Progress indicator - fills from bottom to top */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ height: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
