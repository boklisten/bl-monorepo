import { AccessToken } from "@backend/auth/token/access-token/access-token";
import { RefreshToken } from "@backend/auth/token/refresh/refresh-token";

export class TokenConfig {
  constructor(
    private _accessToken: AccessToken,
    private _refreshToken: RefreshToken,
  ) {}

  set refreshToken(refreshToken: RefreshToken) {
    this._refreshToken = refreshToken;
  }

  get refreshToken(): RefreshToken {
    return this._refreshToken;
  }

  set accessToken(accessToken: AccessToken) {
    this._accessToken = accessToken;
  }

  get accessToken(): AccessToken {
    return this._accessToken;
  }
}
