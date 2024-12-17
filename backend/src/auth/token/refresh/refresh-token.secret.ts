import { assertEnv, BlEnvironment } from "@/config/environment";

export class RefreshTokenSecret {
  get(): string {
    return assertEnv(BlEnvironment.REFRESH_TOKEN_SECRET);
  }
}
