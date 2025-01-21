import { IncomingHttpHeaders } from "node:http";

import { APP_CONFIG } from "@backend/application-config.js";
import { BlEnv } from "@backend/config/env.js";

export function createPath(customPath: string): string {
  return BlEnv.SERVER_PATH + customPath;
}

function retrieveBasePath(href: string) {
  const url = new URL(href);
  const host = url.host;
  const protocol = url.protocol;

  return protocol + "//" + host + "/";
}

export function retrieveRefererPath(requestHeaders: IncomingHttpHeaders) {
  let refererUrl = null;

  const refererPath = requestHeaders["referer"];
  const reffererPath = requestHeaders["refferer"];

  if (refererPath) {
    refererUrl = retrieveBasePath(refererPath);
  } else if (reffererPath) {
    refererUrl = retrieveBasePath(reffererPath as string);
  }

  const baseHost =
    BlEnv.API_ENV === "production"
      ? APP_CONFIG.path.host
      : APP_CONFIG.path.local.host;

  if (refererUrl && !refererUrl.includes(baseHost)) {
    refererUrl = null;
  }

  return refererUrl;
}
