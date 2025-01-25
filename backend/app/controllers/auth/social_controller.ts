import { HttpContext } from "@adonisjs/core/http";

import AuthSocialService from "#services/auth_social_service";

export default class SocialController {
  async redirect({ ally, params }: HttpContext) {
    await ally.use(params["provider"]).redirect();
  }

  async callback(ctx: HttpContext) {
    await AuthSocialService.handleCallback(ctx);
  }
}
