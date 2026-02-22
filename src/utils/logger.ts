export enum LogLevel {
  INFO = "INFO",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

export class Logger {
  static log(level: LogLevel, message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    if (data) {
      console.log(logMessage, JSON.stringify(data, null, 2));
    } else {
      console.log(logMessage);
    }
  }

  static info(message: string, data?: unknown) {
    this.log(LogLevel.INFO, message, data);
  }

  static error(message: string, data?: unknown) {
    this.log(LogLevel.ERROR, message, data);
  }

  static debug(message: string, data?: unknown) {
    if (process.env.DEBUG === "true") {
      this.log(LogLevel.DEBUG, message, data);
    }
  }
}
