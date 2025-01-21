import LocalLoginHandler from "@backend/auth/local/local-login.handler.js";
import { TokenHandler } from "@backend/auth/token/token.handler.js";
import { UserHandler } from "@backend/auth/user/user.handler.js";
import { User } from "@backend/types/user.js";

export class UserProvider {
  private userHandler: UserHandler;
  private tokenHandler: TokenHandler;
  constructor(userHandler?: UserHandler, tokenHandler?: TokenHandler) {
    this.userHandler = userHandler ?? new UserHandler();
    this.tokenHandler = tokenHandler ?? new TokenHandler(this.userHandler);
  }

  public async loginOrCreate(
    username: string,
    provider: string,
    providerId: string,
  ): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const user = await this.getUser(username, provider, providerId);

    await this.userHandler.valid(username);

    await LocalLoginHandler.createDefaultLocalLoginIfNoneIsFound(username);

    const tokens = await this.tokenHandler.createTokens(username);

    return { user: user, tokens: tokens };
  }

  private async getUser(
    username: string,
    provider: string,
    providerId: string,
  ): Promise<User> {
    let user;
    try {
      user = await this.userHandler.get(provider, providerId);
    } catch {
      user = await this.userHandler.create(username, provider, providerId);
    }

    return user;
  }
}
