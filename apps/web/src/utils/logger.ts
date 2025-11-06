/**
 * Logger Utility - Centralized logging system
 * Replaces scattered console.log/warn/error with structured logging
 * 
 * Features:
 * - Log levels: DEBUG, INFO, WARN, ERROR
 * - Colored output for better readability
 * - Context support (node key, step name)
 * - Production mode toggle
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  nodeKey?: string;
  stepName?: string;
  nodeType?: string;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private isDevelopment: boolean = typeof import.meta.env !== 'undefined' 
    ? import.meta.env.DEV 
    : process.env.NODE_ENV !== 'production';

  /**
   * Set minimum log level (only logs at this level or higher will be shown)
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Debug level - detailed technical information
   * Only shown in development mode
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment || this.level > LogLevel.DEBUG) return;
    this.log('🔍 DEBUG', message, context, 'color: #6B7280');
  }

  /**
   * Info level - general informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.level > LogLevel.INFO) return;
    this.log('ℹ️ INFO', message, context, 'color: #3B82F6');
  }

  /**
   * Warn level - warning messages that don't stop execution
   */
  warn(message: string, context?: LogContext): void {
    if (this.level > LogLevel.WARN) return;
    this.log('⚠️ WARN', message, context, 'color: #F59E0B');
  }

  /**
   * Error level - error messages
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.level > LogLevel.ERROR) return;
    
    const errorDetails = error instanceof Error 
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;
    
    this.log('❌ ERROR', message, { ...context, error: errorDetails }, 'color: #EF4444; font-weight: bold');
  }

  /**
   * Success level - operation completed successfully
   */
  success(message: string, context?: LogContext): void {
    if (this.level > LogLevel.INFO) return;
    this.log('✅ SUCCESS', message, context, 'color: #10B981');
  }

  /**
   * Execution level - node execution tracking
   */
  execution(message: string, context?: LogContext): void {
    if (this.level > LogLevel.INFO) return;
    this.log('🎯 EXEC', message, context, 'color: #8B5CF6');
  }

  /**
   * Data flow level - data transformation tracking
   */
  dataFlow(message: string, context?: LogContext): void {
    if (this.level > LogLevel.DEBUG) return;
    this.log('📦 DATA', message, context, 'color: #06B6D4');
  }

  /**
   * Internal log method
   */
  private log(level: string, message: string, context?: LogContext, style?: string): void {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    
    // Build context string
    const contextStr = context ? this.formatContext(context) : '';
    
    // Format: [HH:MM:SS] LEVEL Message {context}
    const prefix = `[${timestamp}] ${level}`;
    const fullMessage = contextStr ? `${message} ${contextStr}` : message;
    
    if (style && this.isDevelopment) {
      console.log(`%c${prefix} ${fullMessage}`, style);
    } else {
      console.log(`${prefix} ${fullMessage}`);
    }
    
    // If context has additional data, log it separately
    if (context && Object.keys(context).length > 0) {
      const additionalData = this.getAdditionalData(context);
      if (Object.keys(additionalData).length > 0) {
        console.log('  └─', additionalData);
      }
    }
  }

  /**
   * Format context for inline display
   */
  private formatContext(context: LogContext): string {
    const parts: string[] = [];
    
    if (context.nodeKey) parts.push(`[${context.nodeKey}]`);
    if (context.nodeType) parts.push(`<${context.nodeType}>`);
    if (context.stepName) parts.push(`"${context.stepName}"`);
    
    return parts.length > 0 ? `{${parts.join(' ')}}` : '';
  }

  /**
   * Get additional data to log separately
   */
  private getAdditionalData(context: LogContext): Record<string, unknown> {
    const { nodeKey, stepName, nodeType, ...rest } = context;
    return rest;
  }

  /**
   * Group logs together (useful for complex operations)
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Performance timing
   */
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (msg: string, ctx?: LogContext) => logger.debug(msg, ctx),
  info: (msg: string, ctx?: LogContext) => logger.info(msg, ctx),
  warn: (msg: string, ctx?: LogContext) => logger.warn(msg, ctx),
  error: (msg: string, err?: Error | unknown, ctx?: LogContext) => logger.error(msg, err, ctx),
  success: (msg: string, ctx?: LogContext) => logger.success(msg, ctx),
  execution: (msg: string, ctx?: LogContext) => logger.execution(msg, ctx),
  dataFlow: (msg: string, ctx?: LogContext) => logger.dataFlow(msg, ctx),
  group: (label: string) => logger.group(label),
  groupEnd: () => logger.groupEnd(),
  time: (label: string) => logger.time(label),
  timeEnd: (label: string) => logger.timeEnd(label),
};
