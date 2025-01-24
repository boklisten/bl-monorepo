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
