import { cn } from "@/lib/utils";
import { Gem } from "lucide-react";

export type UnitStatus = "completed" | "in-progress" | "not-started";

interface UnitCardProps {
  name: string;
  arabicName: string;
  status: UnitStatus;
  onClick?: () => void;
  isFirstCompleted?: boolean;
}

export const UnitCard = ({ name, arabicName, status, onClick, isFirstCompleted }: UnitCardProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "completed":
        return "bg-success/10 border-success text-success hover:bg-success/20";
      case "in-progress":
        return "bg-blue-500/10 border-blue-500 text-blue-500 hover:bg-blue-500/20";
      case "not-started":
        return "bg-muted/50 border-border text-muted-foreground opacity-60";
      default:
        return "";
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-full aspect-square w-full border-2 transition-all duration-200 flex flex-col items-center justify-center gap-0 shadow-soft p-1.5 active:scale-95 group",
        getStatusStyles()
      )}
    >
      <p className="text-[8px] font-bold text-center leading-tight" dir="rtl">
        {arabicName}
      </p>
      <p className="text-[6px] font-semibold text-center opacity-70 leading-tight">
        {name}
      </p>

      {isFirstCompleted && status === "completed" && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full pointer-events-none">
          <Gem className="w-7 h-7 text-gray-400 fill-gray-400 opacity-30 group-hover:text-secondary group-hover:fill-secondary group-hover:opacity-100 transition-all duration-200" />
        </div>
      )}
    </button>
  );
};
