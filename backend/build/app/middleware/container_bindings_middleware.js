import { HttpContext } from "@adonisjs/core/http";
import { Logger } from "@adonisjs/core/logger";
export default class ContainerBindingsMiddleware {
    handle(ctx, next) {
        ctx.containerResolver.bindValue(HttpContext, ctx);
        ctx.containerResolver.bindValue(Logger, ctx.logger);
        return next();
    }
}
