import { FacebookAuth } from "@backend/auth/external/facebook.auth.js";
import { GoogleAuth } from "@backend/auth/external/google.auth.js";
import { LocalLoginValidator } from "@backend/auth/local/local-login.validator.js";
import { LocalAuth } from "@backend/auth/local/local.auth.js";
import { TokenEndpoint } from "@backend/auth/token/token.endpoint.js";
import { TokenHandler } from "@backend/auth/token/token.handler.js";
import { UserHandler } from "@backend/auth/user/user.handler.js";
import { APP_CONFIG } from "@backend/config/application-config.js";
import { BlEnv } from "@backend/config/env.js";
import { Router } from "express";
import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export function createAuthEndpoints(router: Router) {
  const userHandler = new UserHandler();
  const localLoginValidator = new LocalLoginValidator(userHandler);
  const tokenHandler = new TokenHandler(userHandler);
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: BlEnv.ACCESS_TOKEN_SECRET,
    issuer: APP_CONFIG.token.access.iss,
    audience: APP_CONFIG.token.access.aud,
  };
  passport.use(
    new Strategy(options, (accessToken, done) => {
      done(null, { accessToken });
    }),
  );

  new GoogleAuth(router);
  new FacebookAuth(router);
  new LocalAuth(router, localLoginValidator, tokenHandler);
  new TokenEndpoint(router, tokenHandler);
}
