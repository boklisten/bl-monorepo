import { createLogger, format, transports } from "winston";

import env from "#start/env";

export const logger = createLogger({
  format: format.printf((info) =>
    format.colorize().colorize(info.level, info.message as string),
  ),
  transports: [
    new transports.Console({
      level: env.get("LOG_LEVEL"),
      handleExceptions: true,
    }),
  ],
});
