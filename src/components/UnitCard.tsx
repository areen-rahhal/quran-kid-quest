import { cn } from "@/lib/utils";

export type UnitStatus = "completed" | "in-progress" | "not-started";

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
        return "bg-blue-500/10 border-blue-500 text-blue-500 hover:bg-blue-500/20 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]";
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
        "relative rounded-full aspect-square w-full border-2 transition-all duration-200 flex flex-col items-center justify-center gap-0 shadow-soft p-1.5 active:scale-95",
        getStatusStyles()
      )}
    >
      <p className="text-[8px] font-bold text-center leading-tight" dir="rtl">
        {arabicName}
      </p>
      <p className="text-[6px] font-semibold text-center opacity-70 leading-tight">
        {name}
      </p>
    </button>
  );
};
