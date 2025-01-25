import { createLogger, format, transports } from "winston";

import { BlEnv } from "#services/config/env";

export const logger = createLogger({
  format: format.printf((info) =>
    format.colorize().colorize(info.level, info.message as string),
  ),
  transports: [
    new transports.Console({
      level: BlEnv.LOG_LEVEL,
      handleExceptions: true,
    }),
  ],
});
