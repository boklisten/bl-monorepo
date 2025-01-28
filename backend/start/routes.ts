import router from "@adonisjs/core/services/router";

import LocalAuth from "#services/auth/local/local.auth";
import CollectionEndpointCreator from "#services/collection-endpoint/collection-endpoint-creator";

const AuthSocialController = () =>
  import("#controllers/auth/social_controller");
const AuthTokensController = () =>
  import("#controllers/auth/tokens_controller");

/**
 * auth token
 */
router.post("/token", [AuthTokensController, "token"]).as("auth.token");

/**
 * auth social
 */
router
  .get("/auth/:provider/redirect", [AuthSocialController, "redirect"])
  .as("auth.social.redirect");
router
  .get("/auth/:provider/callback", [AuthSocialController, "callback"])
  .as("auth.social.callback");

LocalAuth.generateEndpoints();

CollectionEndpointCreator.generateEndpoints();
