import { defineConfig, targets } from "@adonisjs/core/logger";
import app from "@adonisjs/core/services/app";

const loggerConfig = defineConfig({
  default: "app",

  loggers: {
    app: {
      enabled: true,
      name: "backend",
      level: "debug",
      transport: {
        targets: targets()
          .pushIf(!app.inProduction, targets.pretty())
          .pushIf(app.inProduction, targets.file({ destination: 1 }))
          .toArray(),
      },
    },
  },
});

export default loggerConfig;

declare module "@adonisjs/core/types" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
