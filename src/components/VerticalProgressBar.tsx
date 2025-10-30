import { Trophy } from "lucide-react";

interface VerticalProgressBarProps {
  completed: number;
  total: number;
}

export const VerticalProgressBar = ({ completed, total }: VerticalProgressBarProps) => {
  const percentage = (completed / total) * 100;
  
  return (
    <div className="flex flex-col items-center pr-4">
      {/* Trophy at top */}
      <Trophy className="w-6 h-6 text-accent mb-3" />
      
      {/* Vertical progress bar container */}
      <div className="relative w-2 h-[600px] bg-secondary/30 rounded-full overflow-hidden">
        {/* Progress indicator - fills from bottom to top */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ height: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
