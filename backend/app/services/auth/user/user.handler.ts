import Blid from "#services/auth/blid";
import HashedPasswordGenerator from "#services/auth/local/hashed-password-generator";
import Messenger from "#services/messenger/messenger";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { Login, User } from "#services/types/user";
import { BlError } from "#shared/bl-error/bl-error";
import { UserDetail } from "#shared/user/user-detail/user-detail";

function getByUsername(username: string): Promise<User> {
  return new Promise((resolve, reject) => {
    if (!username) return reject(new BlError("username is empty or undefined"));

    const databaseQuery = new SEDbQuery();
    databaseQuery.stringFilters = [{ fieldName: "username", value: username }];

    BlStorage.Users.getByQuery(databaseQuery).then(
      ([user]) => {
        if (!user) {
          reject(
            new BlError(
              'could not find user with username "' + username + '"',
            ).code(702),
          );
          return;
        }
        resolve(user);
      },
      (error: BlError) => {
        reject(
          new BlError('could not find user with username "' + username + '"')
            .add(error)
            .code(702),
        );
      },
    );
  });
}

async function getOrNull(username: string): Promise<User | null> {
  try {
    const databaseQuery = new SEDbQuery();
    databaseQuery.stringFilters = [{ fieldName: "username", value: username }];
    const [user] = await BlStorage.Users.getByQuery(databaseQuery);
    return user ?? null;
  } catch {
    return null;
  }
}

async function connectProviderToUser(
  user: User,
  provider: "google" | "facebook",
  providerId: string,
) {
  if (!user.login[provider]?.userId) {
    await BlStorage.Users.update(user.id, {
      login: {
        ...user.login,
        [provider]: { userId: providerId },
      },
    });
  }
}

async function create({
  username,
  password,
  provider,
  providerId,
}: {
  username: string;
  password?: string;
  provider: "facebook" | "google" | "local";
  providerId: string;
}) {
  const blid = await Blid.createUserBlid(provider, providerId);

  const addedUserDetail = await BlStorage.UserDetails.add(
    {
      email: username,
      blid: blid,
      emailConfirmed: isThirdPartyProvider(provider), // email is only valid on creation if using Google or Facebook
      // fixme: it is janky to just add this without all the details
    } as UserDetail,
    { id: blid, permission: "customer" },
  );

  if (!addedUserDetail.emailConfirmed) {
    const emailValidation = await BlStorage.EmailValidations.add({
      userDetailId: addedUserDetail.id,
    });
    await Messenger.emailConfirmation(username, emailValidation.id);
  }

  let login: Login;

  switch (provider) {
    case "google":
      login = { google: { userId: providerId } };
      break;
    case "facebook":
      login = { facebook: { userId: providerId } };
      break;
    case "local": {
      if (!password) {
        throw new Error("'password' is required for local logins");
      }
      const { hashedPassword, salt } =
        await HashedPasswordGenerator.generate(password);
      login = { local: { hashedPassword, salt } };
      break;
    }
    default:
      throw new Error(`Unsupported provider “${provider}”`);
  }

  return await BlStorage.Users.add({
    userDetail: addedUserDetail.id,
    permission: "customer",
    blid: blid,
    username: username,
    login,
  });
}

function isThirdPartyProvider(provider: string): boolean {
  return provider === "google" || provider === "facebook";
}

function valid(username: string): Promise<void> {
  return new Promise((resolve, reject) => {
    getByUsername(username)
      .then(() => {
        resolve();
      })
      .catch((getUserError: BlError) => {
        reject(getUserError);
      });
  });
}

const UserHandler = {
  getByUsername,
  getOrNull,
  create,
  valid,
  connectProviderToUser,
};
export default UserHandler;
