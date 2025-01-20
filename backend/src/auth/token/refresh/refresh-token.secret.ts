import { assertEnv, BlEnvironment } from "@backend/config/environment.js";

export class RefreshTokenSecret {
  get(): string {
    return assertEnv(BlEnvironment.REFRESH_TOKEN_SECRET);
  }
}
