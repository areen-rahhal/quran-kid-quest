import { supabase } from './supabase';

/**
 * Test Supabase connectivity
 * Returns true if Supabase is reachable, false otherwise
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log('[supabaseHealth] Testing Supabase connection...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Simple test: Try to get the auth session (doesn't require auth)
    const { data, error } = await supabase.auth.getSession();
    
    clearTimeout(timeoutId);

    if (error) {
      console.warn('[supabaseHealth] Connection test returned error:', error.message);
      return false;
    }

    console.log('[supabaseHealth] ✓ Supabase connection is healthy');
    return true;
  } catch (error) {
    console.error('[supabaseHealth] Failed to connect to Supabase:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Get Supabase connection status
 * Caches result for 60 seconds to avoid hammering the connection
 */
let cachedHealthStatus: boolean | null = null;
let cachedHealthTimestamp: number = 0;

export async function getSupabaseHealth(): Promise<boolean> {
  const now = Date.now();
  
  // Return cached result if fresh (less than 60 seconds old)
  if (cachedHealthStatus !== null && (now - cachedHealthTimestamp) < 60000) {
    return cachedHealthStatus;
  }

  // Test connection and cache result
  const isHealthy = await testSupabaseConnection();
  cachedHealthStatus = isHealthy;
  cachedHealthTimestamp = now;

  return isHealthy;
}
