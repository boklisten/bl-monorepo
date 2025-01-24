import { APP_CONFIG } from "@backend/lib/config/application-config.js";
import { BlEnv } from "@backend/lib/config/env.js";
export function createPath(customPath) {
    return BlEnv.SERVER_PATH + customPath;
}
function retrieveBasePath(href) {
    const url = new URL(href);
    const host = url.host;
    const protocol = url.protocol;
    return protocol + "//" + host + "/";
}
export function retrieveRefererPath(requestHeaders) {
    let refererUrl = null;
    const refererPath = requestHeaders["referer"];
    const reffererPath = requestHeaders["refferer"];
    if (refererPath) {
        refererUrl = retrieveBasePath(refererPath);
    }
    else if (reffererPath) {
        refererUrl = retrieveBasePath(reffererPath);
    }
    const baseHost = BlEnv.API_ENV === "production"
        ? APP_CONFIG.path.host
        : APP_CONFIG.path.local.host;
    if (refererUrl && !refererUrl.includes(baseHost)) {
        refererUrl = null;
    }
    return refererUrl;
}
