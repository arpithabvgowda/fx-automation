// Define logging levels for consistent usage across the framework
export enum LogLevel {
  INFO = "INFO", // General informational messages
  ERROR = "ERROR", // Error messages
  DEBUG = "DEBUG", // Debug messages for development or troubleshooting
}

/**
 * Logger class for structured logging with timestamps and optional data
 * Can be used throughout the framework for consistent logging
 */
export class Logger {
  /**
   * Generic log method
   * @param level - Log level (INFO, ERROR, DEBUG)
   * @param message - Message to log
   * @param data - Optional additional data to log (object, array, etc.)
   */
  static log(level: LogLevel, message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    if (data) {
      console.log(logMessage, JSON.stringify(data, null, 2));
    } else {
      console.log(logMessage);
    }
  }

  /**
   * Convenience method for info-level logging
   */
  static info(message: string, data?: unknown) {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Convenience method for error-level logging
   */
  static error(message: string, data?: unknown) {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Convenience method for debug-level logging
   * Only logs when environment variable DEBUG is set to "true"
   */
  static debug(message: string, data?: unknown) {
    if (process.env.DEBUG === "true") {
      this.log(LogLevel.DEBUG, message, data);
    }
  }
}
