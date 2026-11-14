/**
 * Enums and classes (access modifiers, interface implementation,
 * static members).
 */

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
}

export function levelName(level: LogLevel): string {
  switch (level) {
    case LogLevel.Debug:
      return "debug";
    case LogLevel.Info:
      return "info";
    case LogLevel.Warn:
      return "warn";
    case LogLevel.Error:
      return "error";
    default:
      return "unknown";
  }
}

export interface Logger {
  log(level: LogLevel, message: string): void;
  history(): string[];
}

export class MemoryLogger implements Logger {
  static readonly defaultLevel = LogLevel.Info;

  private readonly entries: string[] = [];

  constructor(private readonly minLevel: LogLevel = MemoryLogger.defaultLevel) {}

  log(level: LogLevel, message: string): void {
    if (level < this.minLevel) {
      return;
    }
    this.entries.push(`[${levelName(level)}] ${message}`);
  }

  history(): string[] {
    return [...this.entries];
  }
}

const logger: Logger = new MemoryLogger(LogLevel.Warn);
logger.log(LogLevel.Info, "ignored by min level");
logger.log(LogLevel.Error, "kept");
export const logged: string[] = logger.history();
