import { HttpContext } from "@adonisjs/core/http";

import { BringService } from "#services/bring_service";

export default class PostalController {
  async lookupPostalCode(ctx: HttpContext) {
    return await BringService.lookupPostalCode(ctx.request.param("postalCode"));
  }
}
