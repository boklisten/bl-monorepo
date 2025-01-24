import BlErrorHandler from "@backend/lib/bl-error/bl-error.handler.js";
import { BlEnv } from "@backend/lib/config/env.js";
import * as Sentry from "@sentry/node";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
function sendResponse(ctx, blapiRes) {
    ctx.response.status(200);
    ctx.response.send(blapiRes);
}
function sendAuthTokens(ctx, accessToken, refreshToken, referer) {
    const redirectUrl = `${referer ?? BlEnv.CLIENT_URI}auth/token?access_token=${accessToken}&refresh_token=${refreshToken}`;
    ctx.response.redirect(redirectUrl);
}
function sendErrorResponse(ctx, blError) {
    const blapiErrorRes = BlErrorHandler.createBlapiErrorResponse(blError);
    ctx.response.status(blapiErrorRes.httpStatus);
    if (blapiErrorRes.httpStatus === 200) {
        sendResponse(ctx, new BlapiResponse(blapiErrorRes.data));
        return;
    }
    ctx.response.send(blapiErrorRes);
    // Send unknown errors to Sentry
    if (blapiErrorRes.httpStatus === 500) {
        Sentry.captureException(blError);
    }
}
const BlResponseHandler = {
    sendResponse,
    sendAuthTokens,
    sendErrorResponse,
};
export default BlResponseHandler;
