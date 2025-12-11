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
        // Let PostLoginRouter decide whether to send the user to onboarding or goals

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

      {/* Sign Up Link */}
      <div className="relative z-10 text-center mt-8">
        <p className="text-sm text-primary-foreground/80">
          {t('login.noAccount') || "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-primary-foreground underline underline-offset-2 hover:text-primary-foreground/80 transition-colors font-medium"
          >
            {t('login.signUp') || 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
