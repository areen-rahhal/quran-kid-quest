import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern flex items-center justify-center">
      <div className="container max-w-md mx-auto p-4 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">{t('home.title')}</h1>
        <p className="text-muted-foreground text-lg">{t('home.subtitle')}</p>
      </div>
    </div>
  );
};

export default Home;
