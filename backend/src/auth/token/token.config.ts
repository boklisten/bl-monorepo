import { AccessToken } from "@backend/types/access-token.js";
import { RefreshToken } from "@backend/types/refresh-token.js";

export class TokenConfig {
  public accessToken: AccessToken;
  public refreshToken: RefreshToken;

  constructor(accessToken: AccessToken, refreshToken: RefreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
