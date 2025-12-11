import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSigningIn: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName?: string, avatar?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[AuthProvider] Initializing auth state');
        if (import.meta.env.DEV) {
          console.info('[AuthProvider] 🔧 DEVELOPMENT MODE: Using mock authentication fallback for testing');
          console.info('[AuthProvider] Valid test credentials: areenrahhal@gmail.com / password, aya@testmail.com / 123456');
          console.info('[AuthProvider] See AUTH.DEVELOPMENT.MODE.md for details on moving to production.');
        }
        setIsLoading(true);

        // Check if there's an existing session
        const session = await authService.getSession();
        if (session?.user) {
          console.log('[AuthProvider] Found existing session for user:', session.user.email);
          setUser(session.user);
        } else {
          console.log('[AuthProvider] No existing session found');
          setUser(null);
        }

        setIsLoading(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to initialize auth';
        console.error('[AuthProvider] Initialization error:', message);
        setError(message);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen to auth state changes
    const unsubscribe = authService.onAuthStateChange((authUser) => {
      console.log('[AuthProvider] Auth state change detected:', authUser?.email);
      setUser(authUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[AuthProvider] Signing in user:', email);
      setIsSigningIn(true);
      setError(null);

      const result = await authService.signIn(email, password);

      if (result.success && result.user) {
        console.log('[AuthProvider] Sign in successful for:', email);
        setUser(result.user);
        // Clear loginEmail from localStorage as we now have proper auth
        localStorage.removeItem('loginEmail');
        return true;
      } else {
        const errorMsg = result.error || 'Sign in failed';
        console.error('[AuthProvider] Sign in failed:', errorMsg);
        setError(errorMsg);
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      console.error('[AuthProvider] Sign in exception:', message);
      setError(message);
      return false;
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string, avatar?: string): Promise<boolean> => {
    try {
      console.log('[AuthProvider] Signing up user:', email);
      setIsSigningIn(true);
      setError(null);

      const result = await authService.signUp(email, password, fullName, avatar);

      // Note: When email confirmation is enabled, result.user may be null until confirmed
      // We check only result.success to determine if signup was successful
      if (result.success) {
        console.log('[AuthProvider] Sign up successful for:', email);
        if (result.user) {
          setUser(result.user);
        }
        return true;
      } else {
        const errorMsg = result.error || 'Sign up failed';
        console.error('[AuthProvider] Sign up failed:', errorMsg);
        setError(errorMsg);
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      console.error('[AuthProvider] Sign up exception:', message);
      setError(message);
      return false;
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      console.log('[AuthProvider] Signing out user');
      setUser(null);
      setError(null);

      const result = await authService.signOut();
      if (!result.success) {
        console.error('[AuthProvider] Sign out error:', result.error);
        setError(result.error || 'Sign out failed');
      } else {
        console.log('[AuthProvider] Sign out successful');
        // Clear all auth-related localStorage
        localStorage.removeItem('loginEmail');
        localStorage.removeItem('currentParentId');
        localStorage.removeItem('parentProfile');
        localStorage.removeItem('isRegistrationComplete');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      console.error('[AuthProvider] Sign out exception:', message);
      setError(message);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSigningIn,
        error,
        signIn,
        signUp,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
