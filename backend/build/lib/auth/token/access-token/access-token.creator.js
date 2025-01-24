import RefreshTokenValidator from "@backend/lib/auth/token/refresh/refresh-token.validator.js";
import { APP_CONFIG } from "@backend/lib/config/application-config.js";
import { BlEnv } from "@backend/lib/config/env.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import jwt from "jsonwebtoken";
function createPayload(username, userid, permission, userDetailId) {
    return {
        iss: APP_CONFIG.token.access.iss,
        aud: APP_CONFIG.token.access.aud,
        iat: Math.floor(Date.now() / 1000),
        sub: userid,
        username: username,
        permission: permission,
        details: userDetailId,
    };
}
function create(username, userid, permission, userDetailId, refreshToken) {
    return new Promise((resolve, reject) => {
        if (!username || !userid || !refreshToken)
            return reject(new BlError("parameter is empty or undefined")
                .className("TokenHandler")
                .methodName("createAccessToken"));
        RefreshTokenValidator.validate(refreshToken).then(() => {
            jwt.sign(createPayload(username, userid, permission, userDetailId), BlEnv.ACCESS_TOKEN_SECRET, { expiresIn: APP_CONFIG.token.access.expiresIn }, (error, accessToken) => {
                if (error || accessToken === undefined)
                    return reject(new BlError("could not sign jwt")
                        .store("usename", username)
                        .store("permission", permission)
                        .code(905));
                return resolve(accessToken);
            });
        }, (refreshTokenError) => {
            reject(new BlError("refreshToken is not valid")
                .add(refreshTokenError)
                .code(905));
        });
    });
}
const AccessTokenCreator = {
    create,
};
export default AccessTokenCreator;
