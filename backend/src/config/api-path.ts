import { IncomingHttpHeaders } from "node:http";

import { APP_CONFIG } from "@backend/application-config";
import { BlEnvironment, assertEnv } from "@backend/config/environment";

export class ApiPath {
  private readonly baseHost: string;

  constructor() {
    this.baseHost =
      assertEnv(BlEnvironment.API_ENV) === "production"
        ? APP_CONFIG.path.host
        : APP_CONFIG.path.local.host;
  }

  public createPath(customPath: string): string {
    return assertEnv(BlEnvironment.SERVER_PATH) + customPath;
  }

  public retrieveRefererPath(requestHeaders: IncomingHttpHeaders) {
    let refererUrl = null;

    const refererPath = requestHeaders["referer"];
    const reffererPath = requestHeaders["refferer"];

    if (refererPath) {
      refererUrl = this.retrieveBasePath(refererPath);
    } else if (reffererPath) {
      refererUrl = this.retrieveBasePath(reffererPath as string);
    }

    if (refererUrl && !refererUrl.includes(this.baseHost)) {
      refererUrl = null;
    }

    return refererUrl;
  }

  private retrieveBasePath(href: string) {
    const url = new URL(href);
    const host = url.host;
    const protocol = url.protocol;

    return protocol + "//" + host + "/";
  }
}
