import { supabase } from '@/lib/supabase';
import { AuthError, Session, User } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
  session?: Session;
}

/**
 * Development-only test credentials
 * These are only used in development mode when Supabase Auth users don't exist yet
 */
const DEV_TEST_CREDENTIALS = {
  'areenrahhal@gmail.com': 'password',
  'aya@testmail.com': '123456',
  'ahmad@testmail.com': 'TestPass',
  'myadmin@google.com': '123',
};

/**
 * Development mode check
 */
const isDevelopment = import.meta.env.DEV;

/**
 * Authentication Service
 * Handles all Supabase Auth operations following proper security patterns
 */
export const authService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp(email: string, password: string, fullName?: string): Promise<AuthResult> {
    try {
      console.log('[authService] Signing up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
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
