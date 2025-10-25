import { Injectable } from '@nestjs/common';
import { loggerConfig } from '../config/logger.config';

@Injectable()
export class LoggerUtil {
  info(message: string, meta?: Record<string, any>) {
    loggerConfig.info(message, meta);
  }

  debug(message: string, meta?: Record<string, any>) {
    loggerConfig.debug(message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    loggerConfig.warn(message, meta);
  }

  error(message: string, error?: Error | any, meta?: Record<string, any>) {
    if (error instanceof Error) {
      loggerConfig.error(message, { ...meta, error: error.message, stack: error.stack });
    } else {
      loggerConfig.error(message, { ...meta, error });
    }
  }
}

