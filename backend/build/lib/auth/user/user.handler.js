import Blid from "@backend/lib/auth/blid.js";
import LocalLoginHandler from "@backend/lib/auth/local/local-login.handler.js";
import EmailValidationHelper from "@backend/lib/collections/email-validation/helpers/email-validation.helper.js";
import { SEDbQuery } from "@backend/lib/query/se.db-query.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
function getByUsername(username) {
    return new Promise((resolve, reject) => {
        if (!username)
            return reject(new BlError("username is empty or undefined"));
        const databaseQuery = new SEDbQuery();
        databaseQuery.stringFilters = [{ fieldName: "username", value: username }];
        BlStorage.Users.getByQuery(databaseQuery).then((docs) => {
            if (docs.length > 1) {
                handleIfMultipleUsersWithSameEmail(docs)
                    .then((user) => {
                    resolve(user);
                })
                    .catch(() => {
                    reject(new BlError(`could not handle user with multiple entries`));
                });
            }
            else {
                // @ts-expect-error fixme: auto ignored
                resolve(docs[0]);
            }
        }, (error) => {
            reject(new BlError('could not find user with username "' + username + '"')
                .add(error)
                .code(702));
        });
    });
}
function handleIfMultipleUsersWithSameEmail(users) {
    // 2024 update: there are still occurrences of duplicated users, seems like a timing issue, where if you send simultaneous requests fast, it might create multiple.
    // this bit of code is for some of our very first customers that had more than one user
    // this issue came from multiple logins as it was created a new user for Facbook, Google and local
    // even with the same email
    // @ts-expect-error fixme: auto ignored
    let selectedUser = null;
    for (const user of users) {
        if (user.primary) {
            selectedUser = user;
        }
    }
    if (selectedUser) {
        return Promise.resolve(selectedUser);
    }
    else {
        selectedUser = users[0];
        return (BlStorage.Users
            // @ts-expect-error fixme: auto ignored
            .update(selectedUser, { primary: true })
            .then(() => {
            const promiseArray = users.map((user) => BlStorage.Users.update(user.id, 
            // @ts-expect-error fixme: auto ignored
            { movedToPrimary: selectedUser.id }));
            return Promise.all(promiseArray)
                .then(() => {
                // @ts-expect-error fixme: auto ignored
                return selectedUser;
            })
                .catch(() => {
                throw new BlError(`user with multiple entries could not update the other entries with invalid`);
            });
        })
            .catch(() => {
            throw new BlError("user with multiple entries could not update one to primary");
        }));
    }
}
function get(provider, providerId) {
    const blError = new BlError("").className("userHandler").methodName("exists");
    return new Promise((resolve, reject) => {
        if (!provider || provider.length <= 0)
            reject(blError.msg("provider is empty or undefined"));
        if (!providerId || providerId.length <= 0)
            reject(blError.msg("providerId is empty of undefined"));
        const databaseQuery = new SEDbQuery();
        databaseQuery.stringFilters = [
            { fieldName: "login.provider", value: provider },
            { fieldName: "login.providerId", value: providerId },
        ];
        BlStorage.Users.getByQuery(databaseQuery)
            .then((users) => {
            // @ts-expect-error fixme: auto ignored
            resolve(users[0]);
        })
            .catch((error) => {
            reject(new BlError("an error occured when getting user")
                .store("provider", provider)
                .store("providerId", providerId)
                .add(error));
        });
    });
}
async function create(username, provider, providerId) {
    if (!username || username.length <= 0)
        throw new BlError("username is empty or undefined").code(907);
    if (!provider || provider.length <= 0)
        throw new BlError("provider is empty or undefined").code(907);
    if (!providerId || providerId.length <= 0)
        throw new BlError("providerId is empty or undefined").code(907);
    let userExists;
    try {
        userExists = await getByUsername(username);
    }
    catch {
        // @ts-expect-error fixme: auto ignored
        userExists = null;
    }
    if (userExists) {
        if (provider === "local") {
            throw new BlError(`username "${username}" already exists, but trying to create new user with provider "local"`).code(903);
        }
        else if (isThirdPartyProvider(provider)) {
            // if user already exists and the creation is with google or facebook
            try {
                await LocalLoginHandler.get(username);
            }
            catch {
                // if localLogin is not found, should create a default one
                await LocalLoginHandler.createDefaultLocalLogin(username);
            }
            return userExists;
        }
        else {
            throw new BlError(`username "${username}" already exists, but could not link it with new provider "${provider}"`);
        }
    }
    try {
        const blid = await Blid.createUserBlid(provider, providerId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userDetail = {
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
        const addedUserDetail = await BlStorage.UserDetails.add(userDetail, { id: blid, permission: "customer" });
        if (!addedUserDetail.emailConfirmed) {
            await sendEmailValidationLink(addedUserDetail);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newUser = {
            userDetail: addedUserDetail.id,
            permission: "customer",
            blid: blid,
            username: username,
            valid: false,
            login: {
                provider: provider,
                providerId: providerId,
            },
        };
        return await BlStorage.Users.add(newUser, {
            id: blid,
            permission: newUser.permission,
        });
    }
    catch (error) {
        const blError = new BlError("user creation failed").code(903);
        if (error instanceof BlError) {
            blError.add(error);
        }
        else {
            blError.store("UserCreationError", error);
        }
        throw blError;
    }
}
function isThirdPartyProvider(provider) {
    return (provider === "google" || provider === "facebook" || provider === "oauth2");
}
async function sendEmailValidationLink(userDetail) {
    await EmailValidationHelper.createAndSendEmailValidationLink(userDetail.id).catch((sendEmailValidationLinkError) => {
        throw new BlError("could not send out email validation link").add(sendEmailValidationLinkError);
    });
}
function valid(username) {
    return new Promise((resolve, reject) => {
        getByUsername(username)
            .then(() => {
            resolve();
        })
            .catch((getUserError) => {
            reject(getUserError);
        });
    });
}
function exists(provider, providerId) {
    if (!provider || !providerId) {
        return Promise.reject(new BlError("provider or providerId is empty or undefinedl"));
    }
    const databaseQuery = new SEDbQuery();
    databaseQuery.stringFilters = [
        { fieldName: "login.provider", value: provider },
        { fieldName: "login.providerId", value: providerId },
    ];
    return new Promise((resolve, reject) => {
        BlStorage.Users.getByQuery(databaseQuery)
            .then(() => {
            resolve();
        })
            .catch((blError) => {
            reject(new BlError("does not exist").add(blError));
        });
    });
}
const UserHandler = {
    getByUsername,
    get,
    create,
    valid,
    exists,
};
export default UserHandler;
