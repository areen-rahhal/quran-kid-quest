import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate based on user type
    // Aya (parent with existing goals) goes to goals page with parent ID
    if (email.toLowerCase() === "aya@testmail.com") {
      if (currentParentId) {
        navigate(`/goals?profileId=${currentParentId}`);
      } else {
        navigate("/goals");
      }
    } else {
      // Other users go to onboarding
      navigate("/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Islamic Pattern Background */}
      <div className="islamic-pattern absolute inset-0 opacity-20"></div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-strong">
            <BookOpen className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">
            {t('login.title')}
          </h1>
          <p className="text-primary-foreground/90 text-base">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3">
            <Input
              id="email"
              type="email"
              placeholder={t('common.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-base bg-white/95 backdrop-blur-sm border-0 shadow-medium placeholder:text-muted-foreground"
            />
            <Input
              id="password"
              type="password"
              placeholder={t('common.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 text-base bg-white/95 backdrop-blur-sm border-0 shadow-medium placeholder:text-muted-foreground"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold bg-white text-primary hover:bg-white/90 shadow-strong mt-6"
            size="lg"
          >
            {t('login.signIn')}
          </Button>
        </form>
      </div>

      {/* Test Account CTA */}
      <div className="relative z-10 text-center mt-8 space-y-3">
        <p className="text-sm text-primary-foreground/80 mb-3">{t('login.quickLogin')}</p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setEmail("Aya@testmail.com");
              setPassword("123456");
            }}
            className="text-sm text-primary-foreground/90 underline underline-offset-2 hover:text-primary-foreground transition-colors"
          >
            {t('login.testAccounts.parent')}
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("Ahmad@testmail.com");
              setPassword("TestPass");
            }}
            className="text-sm text-primary-foreground/90 underline underline-offset-2 hover:text-primary-foreground transition-colors"
          >
            {t('login.testAccounts.newUser')}
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("Myadmin@google.com");
              setPassword("123");
            }}
            className="text-sm text-primary-foreground/90 underline underline-offset-2 hover:text-primary-foreground transition-colors"
          >
            {t('login.testAccounts.admin')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
