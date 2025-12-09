/**
 * Centralized Logging Utility
 * 
 * Standardizes logging across the application and provides:
 * - Consistent formatting ([ServiceName] message)
 * - PII sanitization for production
 * - Optional integration with error tracking (Sentry, etc.)
 * - Environment-aware behavior (dev vs prod)
 * 
 * Usage:
 * logger.log('MyService', 'Operation completed', data);
 * logger.error('MyService', 'Something went wrong', error);
 * logger.warn('MyService', 'Deprecated path used', { path: '...' });
 */

type LogLevel = 'log' | 'warn' | 'error';

interface LogContext {
  service: string;
  message: string;
  data?: any;
  error?: Error;
  level: LogLevel;
}

/**
 * Sanitize data to remove PII before logging
 * Removes sensitive fields like email, password, token, etc.
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'email', 'phone'];

  // Check if in production - if so, sanitize PII
  const isProd = import.meta.env.PROD;

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      if (isProd) {
        sanitized[field] = '***';
      } else if (field === 'email') {
        // In dev, partially mask emails for debugging
        const email = sanitized[field];
        if (typeof email === 'string' && email.includes('@')) {
          const [local, domain] = email.split('@');
          sanitized[field] = `${local.substring(0, 2)}***@${domain}`;
        }
      }
    }
  }

  return sanitized;
}

/**
 * Format log message with timestamp and level
 */
function formatMessage(context: LogContext): string {
  const timestamp = new Date().toISOString();
  const level = context.level.toUpperCase().padEnd(5);
  return `[${timestamp}] ${level} [${context.service}] ${context.message}`;
}

/**
 * Send log to external service (Sentry, Datadog, etc.)
 * Only in production to avoid noise
 */
async function sendToExternalService(context: LogContext): Promise<void> {
  // TODO: Integrate with Sentry or similar
  // if (import.meta.env.PROD && window.Sentry) {
  //   window.Sentry.captureMessage(context.message, context.level);
  // }
}

/**
 * Core logger implementation
 */
export const logger = {
  /**
   * Log an informational message
   */
  log(service: string, message: string, data?: any): void {
    const sanitized = sanitizeData(data);
    const context: LogContext = { service, message, data: sanitized, level: 'log' };

    console.log(formatMessage(context), sanitized);
  },

  /**
   * Log a warning message
   */
  warn(service: string, message: string, data?: any): void {
    const sanitized = sanitizeData(data);
    const context: LogContext = { service, message, data: sanitized, level: 'warn' };

    console.warn(formatMessage(context), sanitized);
  },

  /**
   * Log an error message
   * Includes stack trace for debugging
   */
  error(service: string, message: string, error?: any): void {
    const errorData = error instanceof Error
      ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
      : { error };

    const sanitized = sanitizeData(errorData);
    const context: LogContext = { service, message, data: sanitized, error, level: 'error' };

    console.error(formatMessage(context), sanitized);

    // Send to external service in production
    sendToExternalService(context).catch(() => {
      // Silently fail if external service unavailable
    });
  },

  /**
   * Create a scoped logger for a specific service
   * Useful for reducing repetition in service files
   */
  scope(serviceName: string) {
    return {
      log: (message: string, data?: any) => logger.log(serviceName, message, data),
      warn: (message: string, data?: any) => logger.warn(serviceName, message, data),
      error: (message: string, error?: any) => logger.error(serviceName, message, error),
    };
  },

  /**
   * Log authentication events (with extra care for PII)
   */
  logAuth(message: string, data?: any): void {
    // Extra sanitization for auth logs
    const sanitized = {
      ...sanitizeData(data),
      email: data?.email ? '***' : undefined,
    };
    this.log('Auth', message, sanitized);
  },

  /**
   * Log database operations
   */
  logDb(operation: string, table: string, data?: any): void {
    const sanitized = sanitizeData(data);
    this.log('Database', `${operation} on ${table}`, sanitized);
  },

  /**
   * Log network requests
   */
  logNetwork(method: string, endpoint: string, status?: number, duration?: number): void {
    const data = {
      method,
      endpoint,
      status,
      duration: duration ? `${duration}ms` : undefined,
    };
    this.log('Network', `${method} ${endpoint}`, data);
  },

  /**
   * Log timing information for performance monitoring
   */
  logPerformance(operation: string, duration: number, metadata?: any): void {
    const sanitized = sanitizeData(metadata);
    this.log('Performance', `${operation} took ${duration}ms`, sanitized);
  },
};

/**
 * Export type for use in other modules
 */
export type Logger = typeof logger;
