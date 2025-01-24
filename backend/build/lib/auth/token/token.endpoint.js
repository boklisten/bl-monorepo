import router from "@adonisjs/core/services/router";
import RefreshTokenValidator from "@backend/lib/auth/token/refresh/refresh-token.validator.js";
import TokenHandler from "@backend/lib/auth/token/token.handler.js";
import { createPath } from "@backend/lib/config/api-path.js";
import BlResponseHandler from "@backend/lib/response/bl-response.handler.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
function generateEndpoint() {
    router.post(createPath("token"), (ctx) => {
        const refreshToken = ctx.request.body()["refreshToken"];
        if (refreshToken) {
            RefreshTokenValidator.validate(refreshToken).then(
            // @ts-expect-error fixme: auto ignored
            (validatedRefreshToken) => {
                TokenHandler.createTokens(validatedRefreshToken.username).then((jwTokens) => {
                    BlResponseHandler.sendResponse(ctx, new BlapiResponse([
                        { accessToken: jwTokens.accessToken },
                        { refreshToken: jwTokens.refreshToken },
                    ]));
                }, (createTokenError) => {
                    BlResponseHandler.sendErrorResponse(ctx, new BlError("could not create tokens")
                        .store("oldRefreshToken", refreshToken)
                        .code(906)
                        .add(createTokenError));
                });
            }, (refreshTokenValidationError) => {
                BlResponseHandler.sendErrorResponse(ctx, new BlError("refreshToken not valid")
                    .code(909)
                    .add(refreshTokenValidationError));
            });
        }
        else {
            BlResponseHandler.sendErrorResponse(ctx, new BlError("bad format").code(701));
        }
    });
    return router;
}
const TokenEndpoint = {
    generateEndpoint,
};
export default TokenEndpoint;
