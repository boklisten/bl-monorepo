import { assertEnv, BlEnvironment } from "@backend/config/environment";
import { createLogger, format, transports } from "winston";

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
