import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type UnitStatus = "completed" | "in-progress" | "locked";

interface UnitCardProps {
  name: string;
  arabicName: string;
  status: UnitStatus;
  onClick?: () => void;
}

export const UnitCard = ({ name, arabicName, status, onClick }: UnitCardProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "completed":
        return "bg-success/10 border-success text-success hover:bg-success/20";
      case "in-progress":
        return "bg-warning/10 border-warning text-warning hover:bg-warning/20";
      case "locked":
        return "bg-muted/50 border-border text-muted-foreground opacity-60 cursor-not-allowed";
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "completed":
        return <Check className="w-3 h-3" />;
      case "locked":
        return <Lock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={status !== "locked" ? onClick : undefined}
      disabled={status === "locked"}
      className={cn(
        "relative rounded-full aspect-square w-full border-2 transition-all duration-200 flex flex-col items-center justify-center gap-0.5 shadow-soft p-2",
        getStatusStyles(),
        status !== "locked" && "active:scale-95"
      )}
    >
      <div className="absolute top-1 right-1">
        {getIcon()}
      </div>
      
      <p className="text-[10px] font-bold text-center leading-tight" dir="rtl">
        {arabicName}
      </p>
      <p className="text-[7px] font-semibold text-center opacity-70 leading-tight">
        {name}
      </p>
    </button>
  );
};
