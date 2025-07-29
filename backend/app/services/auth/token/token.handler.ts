import AccessTokenCreator from "#services/auth/token/access-token/access-token.creator";
import RefreshTokenCreator from "#services/auth/token/refresh/refresh-token.creator";
import UserHandler from "#services/auth/user/user.handler";
import { BlStorage } from "#services/storage/bl-storage";
import { User } from "#services/types/user";
import { BlError } from "#shared/bl-error/bl-error";

const TokenHandler = {
  createTokens(
    username: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return new Promise((resolve, reject) => {
      UserHandler.getByUsername(username).then(
        (theUser: User) => {
          const user = theUser;

          UserHandler.valid(username)
            .then(() => {
              RefreshTokenCreator.create(user.username, user.blid).then(
                (refreshToken: string) => {
                  AccessTokenCreator.create(
                    user.username,
                    user.blid,
                    user.permission,
                    user.userDetail,
                    refreshToken,
                  ).then(
                    async (accessToken: string) => {
                      await BlStorage.Users.update(user.id, {
                        $set: {
                          "login.lastTokenIssuedAt": new Date(),
                        },
                      });
                      resolve({
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                      });
                    },
                    (accessTokenCreationError: BlError) => {
                      reject(
                        new BlError("failed to create accessToken")
                          .code(906)
                          .add(accessTokenCreationError),
                      );
                    },
                  );
                },
                (refreshTokenCreatorError: BlError) => {
                  reject(
                    new BlError("failed to create refreshToken")
                      .code(906)
                      .add(refreshTokenCreatorError),
                  );
                },
              );
            })
            .catch((userValidError: BlError) => {
              reject(
                new BlError("user is not valid").add(userValidError).code(902),
              );
            });
        },
        (getUserError: BlError) => {
          reject(
            new BlError('could not get user with username "' + username + '"')
              .add(getUserError)
              .code(906),
          );
        },
      );
    });
  },
};
export default TokenHandler;
