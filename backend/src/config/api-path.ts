import { IncomingHttpHeaders } from "http";

import { APP_CONFIG } from "@backend/application-config";
import { BlEnvironment, assertEnv } from "@backend/config/environment";

export class ApiPath {
  private readonly baseHost: string;

  constructor() {
    if (assertEnv(BlEnvironment.API_ENV) === "production") {
      this.baseHost = APP_CONFIG.path.host;
    } else {
      this.baseHost = APP_CONFIG.path.local.host;
    }
  }

  public createPath(customPath: string): string {
    return assertEnv(BlEnvironment.SERVER_PATH) + customPath;
  }

  public retrieveRefererPath(reqHeaders: IncomingHttpHeaders) {
    let refererUrl = null;

    const refererPath = reqHeaders["referer"];
    const reffererPath = reqHeaders["refferer"];

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
