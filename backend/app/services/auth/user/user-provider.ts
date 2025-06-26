import LocalLoginHandler from "#services/auth/local/local-login.handler";
import TokenHandler from "#services/auth/token/token.handler";
import UserHandler from "#services/auth/user/user.handler";

async function loginOrCreate(
  username: string,
  provider: string,
  providerId: string,
) {
  if (!(await UserHandler.exists(username))) {
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
