import { assertEnv, BlEnvironment } from "@backend/config/environment.js";

export class AccessTokenSecret {
  public get(): string {
    return assertEnv(BlEnvironment.ACCESS_TOKEN_SECRET);
  }
}
