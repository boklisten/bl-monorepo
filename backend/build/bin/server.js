import "reflect-metadata";
import { Ignitor, prettyPrintError } from "@adonisjs/core";
const APP_ROOT = new URL("../", import.meta.url);
const IMPORTER = (filePath) => {
    if (filePath.startsWith("./") || filePath.startsWith("../")) {
        return import(new URL(filePath, APP_ROOT).href);
    }
    return import(filePath);
};
new Ignitor(APP_ROOT, { importer: IMPORTER })
    .tap((app) => {
    app.booting(async () => {
        // await import("#start/env"); fixme migrate to AdonisJS env
    });
    app.listen("SIGTERM", () => app.terminate());
    app.listenIf(app.managedByPm2, "SIGINT", () => app.terminate());
})
    .httpServer()
    .start()
    .catch((error) => {
    process.exitCode = 1;
    prettyPrintError(error);
});
