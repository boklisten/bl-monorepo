import { FacebookAuth } from "@backend/auth/facebook/facebook.auth.js";
import { GoogleAuth } from "@backend/auth/google/google.auth.js";
import { LocalLoginCreator } from "@backend/auth/local/local-login-creator/local-login-creator.js";
import { LocalLoginHandler } from "@backend/auth/local/local-login.handler.js";
import { LocalLoginValidator } from "@backend/auth/local/local-login.validator.js";
import { LocalAuth } from "@backend/auth/local/local.auth.js";
import { HashedPasswordGenerator } from "@backend/auth/local/password/hashed-password-generator.js";
import { LocalLoginPasswordValidator } from "@backend/auth/local/password/local-login-password.validator.js";
import { ProviderIdGenerator } from "@backend/auth/local/provider-id/provider-id-generator.js";
import { SaltGenerator } from "@backend/auth/local/salt/salt-generator.js";
import { AccessTokenAuth } from "@backend/auth/token/access-token/access-token.auth.js";
import { TokenEndpoint } from "@backend/auth/token/token.endpoint.js";
import { TokenHandler } from "@backend/auth/token/token.handler.js";
import { UserHandler } from "@backend/auth/user/user.handler.js";
import { SEResponseHandler } from "@backend/response/se.response.handler.js";
import { Router } from "express";

export function createAuthEndpoints(router: Router) {
  const userHandler = new UserHandler();

  const localLoginPasswordValidator = new LocalLoginPasswordValidator();

  const localLoginHandler = new LocalLoginHandler();
  const saltGenerator = new SaltGenerator();
  const hashedPasswordGenerator = new HashedPasswordGenerator(saltGenerator);
  const providerIdGenerator = new ProviderIdGenerator();
  const localLoginCreator = new LocalLoginCreator(
    hashedPasswordGenerator,
    providerIdGenerator,
  );
  const localLoginValidator = new LocalLoginValidator(
    localLoginHandler,
    localLoginPasswordValidator,
    localLoginCreator,
    userHandler,
  );
  const resHandler = new SEResponseHandler();

  const tokenHandler = new TokenHandler(userHandler);

  new AccessTokenAuth();

  new GoogleAuth(router, resHandler);
  new FacebookAuth(router, resHandler);
  new LocalAuth(router, localLoginValidator, resHandler, tokenHandler);
  new TokenEndpoint(router, resHandler, tokenHandler);
}
