import LocalLoginHandler from "@backend/auth/local/local-login.handler.js";
import TokenHandler from "@backend/auth/token/token.handler.js";
import UserHandler from "@backend/auth/user/user.handler.js";
import { User } from "@backend/types/user.js";

async function getUser(
  username: string,
  provider: string,
  providerId: string,
): Promise<User> {
  let user;
  try {
    user = await UserHandler.get(provider, providerId);
  } catch {
    user = await UserHandler.create(username, provider, providerId);
  }

  return user;
}

async function loginOrCreate(
  username: string,
  provider: string,
  providerId: string,
): Promise<{
  user: User;
  tokens: { accessToken: string; refreshToken: string };
}> {
  const user = await getUser(username, provider, providerId);

  await UserHandler.valid(username);

  await LocalLoginHandler.createDefaultLocalLoginIfNoneIsFound(username);

  const tokens = await TokenHandler.createTokens(username);

  return { user: user, tokens: tokens };
}

const UserProvider = {
  loginOrCreate,
};
export default UserProvider;
