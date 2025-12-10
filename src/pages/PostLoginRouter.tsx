import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { isNewUser } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

/**
 * PostLoginRouter is a component that handles post-login routing logic.
 * It checks if the user is new (has 0 goals across all profiles) and routes accordingly:
 * - New user (0 goals) -> /onboarding
 * - Existing user (>0 goals) -> /goals
 */
const PostLoginRouter = () => {
  const navigate = useNavigate();
  const { profiles, isLoading } = useProfile();

  useEffect(() => {
    // Wait for profiles to load
    if (isLoading) {
      return;
    }

    // Determine routing based on goal count
    const newUser = isNewUser(profiles);
    console.log('[PostLoginRouter] User is new:', newUser, '| Total goals:', profiles.reduce((sum, p) => sum + (p.goals?.length || p.goalsCount || 0), 0));

    if (newUser) {
      console.log('[PostLoginRouter] Routing to /onboarding (new user)');
      navigate("/onboarding", { replace: true });
    } else {
      console.log('[PostLoginRouter] Routing to /goals (existing user)');
      navigate("/goals", { replace: true });
    }
  }, [isLoading, profiles, navigate]);

  // Show loading state while profiles are being loaded
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft islamic-pattern">
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-muted-foreground text-lg">Loading your profile...</p>
      </div>
    </div>
  );
};

export default PostLoginRouter;
