import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // No actual authentication - just navigate to onboarding
    navigate("/onboarding");
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
            Welcome Back
          </h1>
          <p className="text-primary-foreground/90 text-base">
            Continue your Quran journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3">
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-base bg-white/95 backdrop-blur-sm border-0 shadow-medium placeholder:text-muted-foreground"
            />
            <Input
              id="password"
              type="password"
              placeholder="Password"
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
            Sign In
          </Button>
        </form>
      </div>

      {/* Bottom Hint */}
      <div className="relative z-10 text-center mt-8">
        <p className="text-sm text-primary-foreground/70">
          Test: Myadmin@google.com / 123
        </p>
      </div>
    </div>
  );
};

export default Login;
