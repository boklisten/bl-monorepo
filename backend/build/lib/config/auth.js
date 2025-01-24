import { APP_CONFIG } from "@backend/lib/config/application-config.js";
import { BlEnv } from "@backend/lib/config/env.js";
import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
// fixme: do we really need this setup?
export default function setupPassport() {
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        // @ts-expect-error fixme: auto ignored
        done(null, user);
    });
    passport.use(new Strategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: BlEnv.ACCESS_TOKEN_SECRET,
        issuer: APP_CONFIG.token.access.iss,
        audience: APP_CONFIG.token.access.aud,
    }, (accessToken, done) => {
        done(null, { accessToken });
    }));
}
