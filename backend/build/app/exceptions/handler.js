import { ExceptionHandler } from "@adonisjs/core/http";
import app from "@adonisjs/core/services/app";
export default class HttpExceptionHandler extends ExceptionHandler {
    debug = !app.inProduction;
    async handle(error, ctx) {
        return super.handle(error, ctx);
    }
    async report(error, ctx) {
        return super.report(error, ctx);
    }
}
