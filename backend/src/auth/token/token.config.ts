import { AccessToken } from "@backend/auth/token/access-token/access-token";
import { RefreshToken } from "@backend/auth/token/refresh/refresh-token";

export class TokenConfig {
  public accessToken: AccessToken;
  public refreshToken: RefreshToken;

  constructor(accessToken: AccessToken, refreshToken: RefreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
