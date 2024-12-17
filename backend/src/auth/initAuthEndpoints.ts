import { Router } from "express";

import { FacebookAuth } from "@/auth/facebook/facebook.auth";
import { GoogleAuth } from "@/auth/google/google.auth";
import { LocalLoginCreator } from "@/auth/local/local-login-creator/local-login-creator";
import { LocalLoginHandler } from "@/auth/local/local-login.handler";
import { LocalLoginValidator } from "@/auth/local/local-login.validator";
import { LocalAuth } from "@/auth/local/local.auth";
import { HashedPasswordGenerator } from "@/auth/local/password/hashed-password-generator";
import { LocalLoginPasswordValidator } from "@/auth/local/password/local-login-password.validator";
import { ProviderIdGenerator } from "@/auth/local/provider-id/provider-id-generator";
import { SaltGenerator } from "@/auth/local/salt/salt-generator";
import { AccessTokenAuth } from "@/auth/token/access-token/access-token.auth";
import { TokenEndpoint } from "@/auth/token/token.endpoint";
import { TokenHandler } from "@/auth/token/token.handler";
import { UserHandler } from "@/auth/user/user.handler";
import { SeCrypto } from "@/crypto/se.crypto";
import { SEResponseHandler } from "@/response/se.response.handler";

export function initAuthEndpoints(router: Router) {
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
