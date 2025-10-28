import { Star, Flame, BookOpen } from "lucide-react";

interface AchievementCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
}

const AchievementCard = ({ icon, value, label, color }: AchievementCardProps) => {
  return (
    <div className={`flex-1 bg-card rounded-xl p-4 shadow-soft border-2 ${color}`}>
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

interface AchievementsRowProps {
  stars: number;
  streak: number;
  recitations: number;
}

export const AchievementsRow = ({ stars, streak, recitations }: AchievementsRowProps) => {
  return (
    <div className="flex gap-3 mb-6">
      <AchievementCard
        icon={<Star className="w-8 h-8 text-accent fill-accent" />}
        value={stars}
        label="Stars"
        color="border-accent/20"
      />
      <AchievementCard
        icon={<Flame className="w-8 h-8 text-warning" />}
        value={streak}
        label="Day Streak"
        color="border-warning/20"
      />
      <AchievementCard
        icon={<BookOpen className="w-8 h-8 text-secondary" />}
        value={recitations}
        label="Recitations"
        color="border-secondary/20"
      />
    </div>
  );
};
