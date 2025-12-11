import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn, isSigningIn, error, clearError } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

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

        // Navigate to post-login router which will determine if user is new or existing
        navigate("/post-login");
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

      {/* Test Account Info (Development Only) */}
      {import.meta.env.DEV && (
        <div className="relative z-10 text-center mt-4 p-4 bg-blue-100/20 rounded-lg border border-blue-300/30 space-y-2">
          <p className="text-xs text-blue-700/80 font-semibold">🔧 Development Mode - Test with Mock Auth</p>

          <div className="space-y-2 text-left text-xs text-blue-700">
            <p className="font-mono bg-black/20 p-2 rounded">
              <span className="text-green-300">areenrahhal@gmail.com</span> / <span className="text-yellow-300">password</span>
            </p>
            <p className="font-mono bg-black/20 p-2 rounded">
              <span className="text-green-300">aya@testmail.com</span> / <span className="text-yellow-300">123456</span>
            </p>
          </div>
          <p className="text-xs text-blue-700/60">
            These use development fallback auth (mock users for testing)
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
              const success = await signIn("areenrahhal@gmail.com", "password");
              if (success) {
                navigate("/post-login");
              }
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
              const success = await signIn("aya@testmail.com", "123456");
              if (success) {
                navigate("/post-login");
              }
            }}
            disabled={isSigningIn}
            className="text-sm text-primary-foreground/90 underline underline-offset-2 hover:text-primary-foreground transition-colors disabled:opacity-50"
          >
            {t('login.testAccounts.parent')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
