/**
 * Supabase Timeout Utility
 * 
 * Provides a timeout wrapper for Supabase promises since supabase-js v2
 * does not support AbortController signal propagation to HTTP requests.
 * 
 * This ensures all Supabase queries have a maximum execution time.
 */

/**
 * Wraps a promise with a timeout
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param operationName - Name of operation for error logging
 * @returns Promise that rejects if timeout exceeded
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string = 'Unknown operation'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`[supabaseTimeout] ${operationName} timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Default timeout for Supabase queries (10 seconds)
 */
export const SUPABASE_QUERY_TIMEOUT = 10000;

/**
 * Shorter timeout for health checks (5 seconds)
 */
export const SUPABASE_HEALTH_TIMEOUT = 5000;

/**
 * Helper to wrap Supabase queries with standard timeout
 * @param promise - Supabase query promise
 * @param operationName - Name for logging
 * @returns Promise with timeout enforced
 */
export function withSupabaseTimeout<T>(
  promise: Promise<T>,
  operationName: string
): Promise<T> {
  return withTimeout(promise, SUPABASE_QUERY_TIMEOUT, operationName);
}

/**
 * Helper to wrap health check queries with shorter timeout
 * @param promise - Health check promise
 * @param operationName - Name for logging
 * @returns Promise with shorter timeout enforced
 */
export function withHealthCheckTimeout<T>(
  promise: Promise<T>,
  operationName: string
): Promise<T> {
  return withTimeout(promise, SUPABASE_HEALTH_TIMEOUT, operationName);
}
