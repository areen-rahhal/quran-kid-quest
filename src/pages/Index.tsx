import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { Star, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import boyReadingQuran from "@/assets/boy-reading-quran.json";

const Index = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern flex flex-col items-center justify-between p-6 relative overflow-hidden">
      {/* Language Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
          aria-label={t('common.switchLanguage')}
        >
          <Globe className="w-5 h-5" />
          <span className="text-sm font-bold">{t('common.language')}</span>
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-12 left-8">
        <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 opacity-60" />
      </div>
      <div className="absolute top-8 right-12 w-48 h-48 bg-emerald-300 rounded-full opacity-40 blur-2xl" />
      <div className="absolute bottom-32 left-8 w-32 h-32 bg-yellow-100 rounded-full opacity-50 blur-xl" />
      <div className="absolute bottom-48 right-16 w-24 h-24 bg-blue-200 rounded-full opacity-40 blur-xl" />
      <div className="absolute bottom-8 right-8">
        <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 opacity-50" />
      </div>

      <div className="container max-w-md mx-auto flex flex-col items-center justify-center flex-1 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-emerald-600 mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
            Children's Quran
          </h1>
        </div>

        {/* Illustration */}
        <div className="w-80 h-80 mb-8">
          <Lottie animationData={boyReadingQuran} loop={true} />
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Let's Learn, Play and Memorize!
          </h2>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/register")}
            className="flex items-center justify-center gap-2 px-12 py-4 bg-emerald-500 text-white font-bold text-lg rounded-full hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <Star className="w-6 h-6 fill-white" />
            Create Account
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-12 py-3 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors underline underline-offset-2"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
