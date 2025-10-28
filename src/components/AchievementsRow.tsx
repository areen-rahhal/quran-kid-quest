import { Star, Flame, BookOpen } from "lucide-react";

interface AchievementCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
}

const AchievementCard = ({ icon, value, color }: Omit<AchievementCardProps, 'label'>) => {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <p className="text-sm font-bold text-foreground">{value}</p>
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
    <div className="flex gap-4 mb-4 justify-center">
      <AchievementCard
        icon={<Star className="w-4 h-4 text-accent fill-accent" />}
        value={stars}
        color=""
      />
      <AchievementCard
        icon={<Flame className="w-4 h-4 text-warning" />}
        value={streak}
        color=""
      />
      <AchievementCard
        icon={<BookOpen className="w-4 h-4 text-secondary" />}
        value={recitations}
        color=""
      />
    </div>
  );
};
