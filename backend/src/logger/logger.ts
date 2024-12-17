import { createLogger, format, transports } from "winston";

import { assertEnv, BlEnvironment } from "@/config/environment";

export const logger = createLogger({
  format: format.printf((info) =>
    format.colorize().colorize(info.level, info.message as string),
  ),
  transports: [
    new transports.Console({
      level: assertEnv(BlEnvironment.LOG_LEVEL),
      handleExceptions: true,
    }),
  ],
});
