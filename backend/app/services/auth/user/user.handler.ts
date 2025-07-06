import Blid from "#services/auth/blid";
import LocalLoginHandler from "#services/auth/local/local-login.handler";
import EmailValidationHelper from "#services/collections/email-validation/helpers/email-validation.helper";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { User } from "#services/types/user";
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

async function create(
  username: string,
  provider: string,
  providerId: string,
): Promise<User> {
  if (!username || username.length <= 0)
    throw new BlError("username is empty or undefined").code(907);
  if (!provider || provider.length <= 0)
    throw new BlError("provider is empty or undefined").code(907);
  if (!providerId || providerId.length <= 0)
    throw new BlError("providerId is empty or undefined").code(907);

  let userExists: User;
  try {
    userExists = await getByUsername(username);
  } catch {
    // @ts-expect-error fixme: auto ignored
    userExists = null;
  }

  if (userExists) {
    if (provider === "local") {
      throw new BlError(
        `username "${username}" already exists, but trying to create new user with provider "local"`,
      ).code(903);
    } else if (isThirdPartyProvider(provider)) {
      // if user already exists and the creation is with google or facebook
      try {
        await LocalLoginHandler.get(username);
      } catch {
        // if localLogin is not found, should create a default one
        await LocalLoginHandler.createDefaultLocalLogin(username);
      }

      return userExists;
    } else {
      throw new BlError(
        `username "${username}" already exists, but could not link it with new provider "${provider}"`,
      );
    }
  }

  try {
    const blid = await Blid.createUserBlid(provider, providerId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userDetail: any = {
      email: username,
      blid: blid,
      emailConfirmed: isThirdPartyProvider(provider), // email is only valid on creation if using Google or Facebook
    };

    if (isThirdPartyProvider(provider)) {
      // if the provider is google or facebook, should create a default localLogin
      // this so that when the user tries to login with username or password he can
      // ask for a new password via email

      await LocalLoginHandler.createDefaultLocalLogin(username);
    }

    const addedUserDetail: UserDetail = await BlStorage.UserDetails.add(
      userDetail,
      { id: blid, permission: "customer" },
    );

    if (!addedUserDetail.emailConfirmed) {
      await sendEmailValidationLink(addedUserDetail);
    }

    const login: Partial<Record<"google" | "facebook", { userId: string }>> =
      {};

    if (provider === "google") {
      login.google = { userId: providerId };
    } else if (provider === "facebook") {
      login.facebook = { userId: providerId };
    }

    const newUser: User = {
      // @ts-expect-error fixme bad types
      id: undefined,
      userDetail: addedUserDetail.id,
      permission: "customer",
      blid: blid,
      username: username,
      login,
    };

    return await BlStorage.Users.add(newUser, {
      id: blid,
      permission: newUser.permission,
    });
  } catch (error) {
    const blError = new BlError("user creation failed").code(903);

    if (error instanceof BlError) {
      blError.add(error);
    } else {
      blError.store("UserCreationError", error);
    }

    throw blError;
  }
}

function isThirdPartyProvider(provider: string): boolean {
  return (
    provider === "google" || provider === "facebook" || provider === "oauth2"
  );
}

async function sendEmailValidationLink(userDetail: UserDetail): Promise<void> {
  await EmailValidationHelper.createAndSendEmailValidationLink(
    userDetail.id,
  ).catch((sendEmailValidationLinkError: BlError) => {
    throw new BlError("could not send out email validation link").add(
      sendEmailValidationLinkError,
    );
  });
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
