import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authDevHelper } from "@/services/authDevHelper";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn, isSigningIn, error, clearError } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSettingUpTestUsers, setIsSettingUpTestUsers] = useState(false);

  const handleSetupTestUsers = async () => {
    setIsSettingUpTestUsers(true);
    try {
      await authDevHelper.setupAllTestUsers();
      toast({
        title: 'Test Users Created',
        description: 'All test users have been set up. You can now log in.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to setup test users';
      toast({
        title: 'Setup Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSettingUpTestUsers(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEmail = email.toLowerCase();

    if (!newEmail || !password) {
      setLocalError(t('login.validation.required') || 'Email and password are required');
      return;
    }

    console.log('[Login] User attempting login:', newEmail);
    setLocalError("");
    clearError();

    try {
      const success = await signIn(newEmail, password);

      if (success) {
        console.log('[Login] Sign in successful, redirecting...');
        toast({
          title: t('login.success') || 'Welcome back!',
          description: `Logged in as ${newEmail}`,
        });

        // Navigate based on user type
        // Aya (parent with existing goals) goes to goals page
        // The Goals page will automatically default to the parent profile
        if (newEmail === "aya@testmail.com") {
          navigate("/goals");
        } else {
          // Other users go to onboarding
          navigate("/onboarding");
        }
      } else {
        const errorMsg = error || t('login.failed') || 'Failed to sign in';
        setLocalError(errorMsg);
        toast({
          title: t('login.error') || 'Sign in failed',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setLocalError(message);
      toast({
        title: t('login.error') || 'Error',
        description: message,
        variant: 'destructive',
      });
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
          {(localError || error) && (
            <div className="p-4 bg-red-100/80 border border-red-300 rounded-lg">
              <p className="text-sm text-red-800">
                {localError || error}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Input
              id="email"
              type="email"
              placeholder={t('common.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSigningIn}
              className="h-14 text-base bg-white/95 backdrop-blur-sm border-0 shadow-medium placeholder:text-muted-foreground disabled:opacity-50"
            />
            <Input
              id="password"
              type="password"
              placeholder={t('common.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSigningIn}
              className="h-14 text-base bg-white/95 backdrop-blur-sm border-0 shadow-medium placeholder:text-muted-foreground disabled:opacity-50"
            />
          </div>

          <Button
            type="submit"
            disabled={isSigningIn || !email || !password}
            className="w-full h-14 text-base font-semibold bg-white text-primary hover:bg-white/90 shadow-strong mt-6 disabled:opacity-50"
            size="lg"
          >
            {isSigningIn ? t('login.signingIn') || 'Signing In...' : t('login.signIn')}
          </Button>
        </form>
      </div>

      {/* Test Account Setup (Development Only) */}
      {import.meta.env.DEV && (
        <div className="relative z-10 text-center mt-4 p-3 bg-yellow-100/20 rounded-lg border border-yellow-300/30">
          <p className="text-xs text-yellow-700/80 mb-2">Development Mode</p>
          <button
            type="button"
            onClick={handleSetupTestUsers}
            disabled={isSettingUpTestUsers}
            className="text-xs font-semibold px-3 py-2 bg-yellow-400/30 hover:bg-yellow-400/40 text-yellow-900 rounded border border-yellow-400 disabled:opacity-50 transition-colors"
          >
            {isSettingUpTestUsers ? 'Setting up test users...' : '📝 Setup Test Users'}
          </button>
          <p className="text-xs text-yellow-700/70 mt-2">
            Click above to create Supabase Auth test accounts
          </p>
        </div>
      )}

      {/* Test Account CTA */}
      <div className="relative z-10 text-center mt-8 space-y-3">
        <p className="text-sm text-primary-foreground/80 mb-3">{t('login.quickLogin')}</p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={async () => {
              setEmail("areenrahhal@gmail.com");
              setPassword("password");
              setLocalError("");
              clearError();
              await signIn("areenrahhal@gmail.com", "password");
              navigate("/onboarding");
            }}
            disabled={isSigningIn}
            className="text-sm text-primary-foreground/90 underline underline-offset-2 hover:text-primary-foreground transition-colors disabled:opacity-50"
          >
            Use Areen
          </button>
          <button
            type="button"
            onClick={async () => {
              setEmail("aya@testmail.com");
              setPassword("123456");
              setLocalError("");
              clearError();
              await signIn("aya@testmail.com", "123456");
              navigate("/goals");
            }}
            disabled={isSigningIn}
            className="text-sm text-primary-foreground/90 underline underline-offset-2 hover:text-primary-foreground transition-colors disabled:opacity-50"
          >
            {t('login.testAccounts.parent')}
          </button>
          <button
            type="button"
            onClick={async () => {
              setEmail("ahmad@testmail.com");
              setPassword("TestPass");
              setLocalError("");
              clearError();
              await signIn("ahmad@testmail.com", "TestPass");
              navigate("/onboarding");
            }}
            disabled={isSigningIn}
            className="text-sm text-primary-foreground/90 underline underline-offset-2 hover:text-primary-foreground transition-colors disabled:opacity-50"
          >
            {t('login.testAccounts.newUser')}
          </button>
          <button
            type="button"
            onClick={async () => {
              setEmail("myadmin@google.com");
              setPassword("123");
              setLocalError("");
              clearError();
              await signIn("myadmin@google.com", "123");
              navigate("/goals");
            }}
            disabled={isSigningIn}
            className="text-sm text-primary-foreground/90 underline underline-offset-2 hover:text-primary-foreground transition-colors disabled:opacity-50"
          >
            {t('login.testAccounts.admin')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
