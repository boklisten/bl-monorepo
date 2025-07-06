import LocalLoginHandler from "#services/auth/local/local-login.handler";
import TokenHandler from "#services/auth/token/token.handler";
import UserHandler from "#services/auth/user/user.handler";

async function loginOrCreate(
  username: string,
  provider: "google" | "facebook",
  providerId: string,
) {
  const existingUser = await UserHandler.getOrNull(username);
  if (existingUser) {
    await UserHandler.connectProviderToUser(existingUser, provider, providerId);
  } else {
    await UserHandler.create(username, provider, providerId);
  }

  await UserHandler.valid(username);

  await LocalLoginHandler.createDefaultLocalLoginIfNoneIsFound(username);

  return await TokenHandler.createTokens(username);
}

const UserProvider = {
  loginOrCreate,
};
export default UserProvider;
