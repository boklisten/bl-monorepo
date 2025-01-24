import LocalLoginHandler from "@backend/lib/auth/local/local-login.handler.js";
import TokenHandler from "@backend/lib/auth/token/token.handler.js";
import UserHandler from "@backend/lib/auth/user/user.handler.js";
async function getUser(username, provider, providerId) {
    let user;
    try {
        user = await UserHandler.get(provider, providerId);
    }
    catch {
        user = await UserHandler.create(username, provider, providerId);
    }
    return user;
}
async function loginOrCreate(username, provider, providerId) {
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
