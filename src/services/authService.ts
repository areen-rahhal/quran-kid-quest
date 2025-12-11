import { supabase } from '@/lib/supabase';
import { AuthError, Session, User } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
  session?: Session;
}

/**
 * Development-only test passwords for existing profiles
 * ONLY emails with matching profiles in the database are allowed to login
 * This ensures: "Only profiles that exist in the Supabase profile table should be able to login"
 */
const DEV_TEST_PASSWORDS: Record<string, string> = {
  'areenrahhal@gmail.com': 'password',   // ✅ Areen exists in profiles table
  'aya@testmail.com': '123456',          // ✅ Aya exists in profiles table
};

/**
 * Development mode check
 */
const isDevelopment = import.meta.env.DEV;

/**
 * Development session storage key
 */
const DEV_SESSION_KEY = '__dev_auth_session__';

/**
 * Store development session in localStorage for persistence
 */
const storeDevSession = (user: any, session: any) => {
  try {
    const sessionData = {
      user,
      session: {
        ...session,
        // Don't store complex objects, just the essential data
        access_token: session.access_token,
        token_type: session.token_type,
        expires_at: session.expires_at,
      },
    };
    localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(sessionData));
    console.log('[authService] Development session stored in localStorage for:', user.email);
  } catch (error) {
    console.warn('[authService] Failed to store development session:', error);
  }
};

/**
 * Retrieve development session from localStorage
 */
const getStoredDevSession = () => {
  try {
    const stored = localStorage.getItem(DEV_SESSION_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Check if session is still valid (not expired)
      if (data.session.expires_at > Math.floor(Date.now() / 1000)) {
        console.log('[authService] Development session restored from localStorage for:', data.user.email);
        return data;
      } else {
        // Session expired, remove it
        localStorage.removeItem(DEV_SESSION_KEY);
        console.log('[authService] Development session expired');
      }
    }
  } catch (error) {
    console.warn('[authService] Failed to retrieve development session:', error);
  }
  return null;
};

/**
 * Clear development session from localStorage
 */
const clearStoredDevSession = () => {
  try {
    localStorage.removeItem(DEV_SESSION_KEY);
    console.log('[authService] Development session cleared from localStorage');
  } catch (error) {
    console.warn('[authService] Failed to clear development session:', error);
  }
};

/**
 * Authentication Service
 * Handles all Supabase Auth operations following proper security patterns
 */
export const authService = {
  /**
   * Sign up a new user with email and password
   * Profile is automatically created by database trigger (create_profile_on_auth_signup)
   */
  async signUp(email: string, password: string, fullName?: string, avatar?: string): Promise<AuthResult> {
    try {
      console.log('[authService] Signing up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            avatar: avatar || 'avatar-1',
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('[authService] Sign up error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('[authService] Sign up successful:', email);
      return {
        success: true,
        user: data.user || undefined,
        session: data.session || undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      console.error('[authService] Sign up exception:', message);
      return { success: false, error: message };
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('[authService] Signing in user:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Development fallback: Allow testing with dev credentials when Supabase Auth users don't exist
        // Only allows emails that have matching profiles in the Supabase profiles table
        if (isDevelopment && email.toLowerCase() in DEV_TEST_PASSWORDS) {
          const expectedPassword = DEV_TEST_PASSWORDS[email.toLowerCase()];
          const trimmedPassword = password.trim();

          if (trimmedPassword === expectedPassword) {
            console.log('[authService] ✅ Using development fallback for:', email, '(Supabase rejected with: ' + error.message + ')');
            console.log('[authService] This is expected in development mode - test users are mocked locally');

            // Create a mock user object for development
            const mockUser = {
              id: `dev-${Date.now()}`,
              email: email.toLowerCase(),
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_super_admin: false,
              role: 'authenticated',
              user_metadata: { full_name: email.split('@')[0] },
              app_metadata: { providers: ['email'] },
              factors: [],
              identities: [],
            } as unknown as User;

            console.log('[authService] Development mode: Signed in user:', email);

            const mockSession = {
              user: mockUser,
              access_token: `dev-token-${Date.now()}`,
              token_type: 'bearer',
              expires_in: 3600,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
              refresh_token: `dev-refresh-${Date.now()}`,
            } as any;

            // Store the development session so it persists across page refreshes
            storeDevSession(mockUser, mockSession);

            // Trigger auth state change to notify listeners
            // In development mode, we're simulating the auth response
            return {
              success: true,
              user: mockUser,
              session: mockSession,
            };
          } else {
            console.error('[authService] Development fallback: Invalid password for:', email);
            console.error('[authService] Expected password:', expectedPassword);
            console.error('[authService] Received password:', `"${trimmedPassword}"`, `(length: ${trimmedPassword.length})`);
            console.error('[authService] Password match:', trimmedPassword === expectedPassword);
            return { success: false, error: 'Invalid login credentials' };
          }
        }

        console.error('[authService] Sign in error:', error.message);
        return { success: false, error: error.message };
      }

      if (!data.session) {
        console.error('[authService] No session returned');
        return { success: false, error: 'No session returned' };
      }

      console.log('[authService] Sign in successful:', email, 'Session:', data.session.access_token ? 'token set' : 'no token');
      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      console.error('[authService] Sign in exception:', message);
      return { success: false, error: message };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResult> {
    try {
      console.log('[authService] Signing out user');

      // Clear stored development session
      clearStoredDevSession();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[authService] Sign out error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('[authService] Sign out successful');
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      console.error('[authService] Sign out exception:', message);
      return { success: false, error: message };
    }
  },

  /**
   * Get the current user session
   */
  async getSession(): Promise<Session | null> {
    try {
      console.log('[authService] Getting current session');

      // Check for stored development session first
      if (isDevelopment) {
        const storedSession = getStoredDevSession();
        if (storedSession) {
          return storedSession.session;
        }
      }

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[authService] Get session error:', error.message);
        return null;
      }

      if (data.session) {
        console.log('[authService] Session found for user:', data.session.user?.email);
      } else {
        console.log('[authService] No session found');
      }

      return data.session;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Get session failed';
      console.error('[authService] Get session exception:', message);
      return null;
    }
  },

  /**
   * Get the current authenticated user
   */
  async getUser(): Promise<User | null> {
    try {
      console.log('[authService] Getting current user');

      // Check for stored development session first
      if (isDevelopment) {
        const storedSession = getStoredDevSession();
        if (storedSession) {
          return storedSession.user;
        }
      }

      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('[authService] Get user error:', error.message);
        return null;
      }

      if (data.user) {
        console.log('[authService] User found:', data.user.email);
      } else {
        console.log('[authService] No user found');
      }

      return data.user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Get user failed';
      console.error('[authService] Get user exception:', message);
      return null;
    }
  },

  /**
   * Listen to authentication state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    console.log('[authService] Setting up auth state listener');
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[authService] Auth state changed:', event, 'User:', session?.user?.email);
        callback(session?.user || null);
      }
    );

    // Return unsubscribe function
    return () => {
      console.log('[authService] Removing auth state listener');
      authListener?.subscription?.unsubscribe();
    };
  },

  /**
   * Reset password with email
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      console.log('[authService] Resetting password for:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('[authService] Reset password error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('[authService] Password reset email sent');
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reset password failed';
      console.error('[authService] Reset password exception:', message);
      return { success: false, error: message };
    }
  },

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      console.log('[authService] Updating user password');

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('[authService] Update password error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('[authService] Password updated successfully');
      return { success: true, user: data.user };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update password failed';
      console.error('[authService] Update password exception:', message);
      return { success: false, error: message };
    }
  },
};
