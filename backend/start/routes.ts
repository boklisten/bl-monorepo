import router from "@adonisjs/core/services/router";

import LocalAuth from "#services/auth/local/local.auth";
import TokenEndpoint from "#services/auth/token/token.endpoint";
import CollectionEndpointCreator from "#services/collection-endpoint/collection-endpoint-creator";

const AuthSocialController = () =>
  import("#controllers/auth/social_controller");

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
TokenEndpoint.generateEndpoint();

CollectionEndpointCreator.generateEndpoints();
