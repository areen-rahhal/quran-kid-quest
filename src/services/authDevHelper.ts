import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

/**
 * Development helper for creating test users in Supabase Auth
 * 
 * This is for development only. In production, users should sign up through the app.
 * 
 * Usage:
 * await createTestUser('areenrahhal@gmail.com', 'password', 'Areen')
 */

export const authDevHelper = {
  /**
   * Create a test user in Supabase Auth
   * DEVELOPMENT ONLY - not for production use
   */
  async createTestUser(
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[authDevHelper] Creating test user:', email);

      // Use Supabase admin API via an edge function or direct auth
      // For now, we'll try signUp which will work if the user doesn't exist
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
        // User might already exist, try to sign in to verify
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('[authDevHelper] Error creating/verifying user:', signInError.message);
          return { success: false, error: signInError.message };
        } else {
          console.log('[authDevHelper] User already existed and verified');
          return { success: true };
        }
      }

      console.log('[authDevHelper] Test user created successfully:', email);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create test user';
      console.error('[authDevHelper] Exception:', message);
      return { success: false, error: message };
    }
  },

  /**
   * Set up all test users for development
   */
  async setupAllTestUsers(): Promise<void> {
    const testUsers = [
      { email: 'areenrahhal@gmail.com', password: 'password', name: 'Areen' },
      { email: 'aya@testmail.com', password: '123456', name: 'Aya' },
      { email: 'ahmad@testmail.com', password: 'TestPass', name: 'Ahmad' },
      { email: 'myadmin@google.com', password: '123', name: 'Admin' },
    ];

    console.log('[authDevHelper] Setting up test users...');
    for (const user of testUsers) {
      const result = await this.createTestUser(user.email, user.password, user.name);
      console.log('[authDevHelper]', user.email, result.success ? '✓' : '✗', result.error || '');
    }
  },

  /**
   * Get all auth users (admin only - requires admin privileges)
   * This won't work with anon key, only with admin key
   */
  async getAllAuthUsers(): Promise<User[]> {
    try {
      // This endpoint requires admin key, won't work with anon key
      const response = await fetch('/.netlify/functions/list-users', {
        method: 'GET',
      });
      
      if (!response.ok) {
        console.warn('[authDevHelper] Cannot list users (requires admin key)');
        return [];
      }

      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.warn('[authDevHelper] Cannot list auth users:', error);
      return [];
    }
  },
};
