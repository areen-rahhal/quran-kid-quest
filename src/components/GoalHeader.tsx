import { ArrowLeft } from "lucide-react";

interface GoalHeaderProps {
  goalName: string;
  surahCount: number;
  ayatCount: number;
  onBack?: () => void;
}
export const GoalHeader = ({
  goalName,
  surahCount,
  ayatCount,
  onBack
}: GoalHeaderProps) => {
  return (
    <div className="relative overflow-hidden bg-gradient-primary rounded-3xl p-6 mb-6 shadow-strong">
      <div className="islamic-pattern absolute inset-0 opacity-30"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="text-white/90 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            {goalName}
          </h1>
        </div>
        <p className="text-white/90 text-base ml-11">
          {surahCount} Surahs · {ayatCount} Ayat
        </p>
      </div>
    </div>
  );
};