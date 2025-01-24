import AccessTokenCreator from "@backend/lib/auth/token/access-token/access-token.creator.js";
import RefreshTokenCreator from "@backend/lib/auth/token/refresh/refresh-token.creator.js";
import UserHandler from "@backend/lib/auth/user/user.handler.js";
import { BlError } from "@shared/bl-error/bl-error.js";
function createTokens(username) {
    return new Promise((resolve, reject) => {
        UserHandler.getByUsername(username).then((theUser) => {
            const user = theUser;
            UserHandler.valid(username)
                .then(() => {
                RefreshTokenCreator.create(user.username, user.blid).then((refreshToken) => {
                    AccessTokenCreator.create(user.username, user.blid, user.permission, user.userDetail, refreshToken).then((accessToken) => {
                        resolve({
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                        });
                    }, (accessTokenCreationError) => {
                        reject(new BlError("failed to create accessToken")
                            .code(906)
                            .add(accessTokenCreationError));
                    });
                }, (refreshTokenCreatorError) => {
                    reject(new BlError("failed to create refreshToken")
                        .code(906)
                        .add(refreshTokenCreatorError));
                });
            })
                .catch((userValidError) => {
                reject(new BlError("user is not valid").add(userValidError).code(902));
            });
        }, (getUserError) => {
            reject(new BlError('could not get user with username "' + username + '"')
                .add(getUserError)
                .code(906));
        });
    });
}
const TokenHandler = {
    createTokens,
};
export default TokenHandler;
