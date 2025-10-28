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
        return <Check className="w-5 h-5" />;
      case "locked":
        return <Lock className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={status !== "locked" ? onClick : undefined}
      disabled={status === "locked"}
      className={cn(
        "relative rounded-2xl p-4 border-2 transition-all duration-200 min-h-[100px] flex flex-col items-center justify-center gap-2 shadow-soft",
        getStatusStyles(),
        status !== "locked" && "active:scale-95"
      )}
    >
      <div className="absolute top-2 right-2">
        {getIcon()}
      </div>
      
      <p className="text-lg font-bold text-center mb-1" dir="rtl">
        {arabicName}
      </p>
      <p className="text-xs font-semibold text-center opacity-80">
        {name}
      </p>
    </button>
  );
};
