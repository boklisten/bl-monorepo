import { FacebookAuth } from "@backend/auth/facebook/facebook.auth";
import { GoogleAuth } from "@backend/auth/google/google.auth";
import { LocalLoginCreator } from "@backend/auth/local/local-login-creator/local-login-creator";
import { LocalLoginHandler } from "@backend/auth/local/local-login.handler";
import { LocalLoginValidator } from "@backend/auth/local/local-login.validator";
import { LocalAuth } from "@backend/auth/local/local.auth";
import { HashedPasswordGenerator } from "@backend/auth/local/password/hashed-password-generator";
import { LocalLoginPasswordValidator } from "@backend/auth/local/password/local-login-password.validator";
import { ProviderIdGenerator } from "@backend/auth/local/provider-id/provider-id-generator";
import { SaltGenerator } from "@backend/auth/local/salt/salt-generator";
import { AccessTokenAuth } from "@backend/auth/token/access-token/access-token.auth";
import { TokenEndpoint } from "@backend/auth/token/token.endpoint";
import { TokenHandler } from "@backend/auth/token/token.handler";
import { UserHandler } from "@backend/auth/user/user.handler";
import { SeCrypto } from "@backend/crypto/se.crypto";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { Router } from "express";

export function createAuthEndpoints(router: Router) {
  const userHandler = new UserHandler();

  const localLoginPasswordValidator = new LocalLoginPasswordValidator(
    new SeCrypto(),
  );

  const localLoginHandler = new LocalLoginHandler();
  const seCrypto = new SeCrypto();
  const saltGenerator = new SaltGenerator();
  const hashedPasswordGenerator = new HashedPasswordGenerator(
    saltGenerator,
    seCrypto,
  );
  const providerIdGenerator = new ProviderIdGenerator(seCrypto);
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
