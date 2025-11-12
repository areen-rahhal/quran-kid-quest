import { useTranslation } from 'react-i18next';

interface GoalHeaderProps {
  goalName: string;
  surahCount: number;
  ayatCount: number;
}
export const GoalHeader = ({
  goalName,
  surahCount,
  ayatCount
}: GoalHeaderProps) => {
  const { t } = useTranslation();

  return <div className="relative overflow-hidden bg-gradient-primary rounded-3xl p-6 mb-6 shadow-strong">
      <div className="islamic-pattern absolute inset-0 opacity-30"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">
            {goalName}
          </h1>

        </div>
        <p className="text-white/90 text-base">
          {surahCount} {t('goals.surahCount')} · {ayatCount} {t('goals.ayatCount')}
        </p>
      </div>
    </div>;
};
