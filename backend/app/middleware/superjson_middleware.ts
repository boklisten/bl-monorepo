import type { HttpContext } from "@adonisjs/core/http";
import { NextFn } from "@adonisjs/core/types/http";
import superjson from "superjson";

export default class SuperjsonMiddleware {
  async handle({ response }: HttpContext, next: NextFn) {
    await next();
    if (response.content) {
      response.send(superjson.stringify(response.content[0]));
    }
  }
}
