import { AchievementsRow } from "./AchievementsRow";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  // Global achievements state - can be moved to context or backend later
  const stars = 42;
  const streak = 7;
  const recitations = 15;

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern pb-8">
      <div className="container max-w-md mx-auto p-4 pt-6">
        <AchievementsRow 
          stars={stars}
          streak={streak}
          recitations={recitations}
        />
        
        {children}
      </div>
    </div>
  );
};
