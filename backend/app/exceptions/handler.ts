import { HttpContext, ExceptionHandler } from "@adonisjs/core/http";
import app from "@adonisjs/core/services/app";
import * as Sentry from "@sentry/node";

export default class HttpExceptionHandler extends ExceptionHandler {
  protected override debug = !app.inProduction;
  override async handle(error: unknown, ctx: HttpContext) {
    return super.handle(error, ctx);
  }
  override async report(error: unknown, ctx: HttpContext) {
    Sentry.captureException(error);
    return super.report(error, ctx);
  }
}
