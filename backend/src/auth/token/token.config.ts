import { AccessToken } from "@backend/auth/token/access-token/access-token.js";
import { RefreshToken } from "@backend/auth/token/refresh/refresh-token.js";

export class TokenConfig {
  public accessToken: AccessToken;
  public refreshToken: RefreshToken;

  constructor(accessToken: AccessToken, refreshToken: RefreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
