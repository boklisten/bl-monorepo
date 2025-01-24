import HashedPasswordGenerator from "@backend/lib/auth/local/hashed-password-generator.js";
import LocalLoginCreator from "@backend/lib/auth/local/local-login-creator.js";
import BlCrypto from "@backend/lib/config/bl-crypto.js";
import { isNullish } from "@backend/lib/helper/typescript-helpers.js";
import { SEDbQuery } from "@backend/lib/query/se.db-query.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import validator from "validator";
function get(username) {
    return new Promise((resolve, reject) => {
        if (!username || !validator.isEmail(username))
            return reject(new BlError(`username "${username}" is not a valid email`));
        const databaseQuery = new SEDbQuery();
        databaseQuery.stringFilters = [{ fieldName: "username", value: username }];
        BlStorage.LocalLogins.getByQuery(databaseQuery)
            .then((localLogins) => {
            if (localLogins.length !== 1) {
                return reject(new BlError('could not get LocalLogin by the provided username "' +
                    username +
                    '"').store("username", username));
            }
            // @ts-expect-error fixme: auto ignored
            return resolve(localLogins[0]);
        })
            .catch((error) => {
            return reject(new BlError(`could not get localLogin with username "${username}"`)
                .code(702)
                .add(error));
        });
    });
}
async function createDefaultLocalLoginIfNoneIsFound(username) {
    try {
        await get(username);
    }
    catch (error) {
        if (error instanceof BlError && error.getCode() === 702) {
            await createDefaultLocalLogin(username);
        }
        else {
            throw new BlError("could not create default localLogin");
        }
    }
    return true;
}
async function createDefaultLocalLogin(username) {
    let alreadyAddedLocalLogin = null;
    try {
        alreadyAddedLocalLogin = await get(username);
    }
    catch {
        alreadyAddedLocalLogin = null;
    }
    if (alreadyAddedLocalLogin) {
        return true;
    }
    try {
        const randomPassword = BlCrypto.random();
        const defaultLocalLogin = await LocalLoginCreator.create(username, randomPassword);
        await BlStorage.LocalLogins.add(defaultLocalLogin);
        return true;
    }
    catch (error) {
        throw new BlError("could not create default localLogin").store("localLoginCreationError", error);
    }
}
function setPassword(username, password) {
    return new Promise((resolve, reject) => {
        if (isNullish(password) || password.length < 6) {
            return reject(new BlError("localLogin password to short"));
        }
        get(username)
            .then((localLogin) => {
            HashedPasswordGenerator.generate(password)
                .then((hashedPasswordAndSalt) => {
                localLogin.hashedPassword = hashedPasswordAndSalt.hashedPassword;
                localLogin.salt = hashedPasswordAndSalt.salt;
                BlStorage.LocalLogins.update(localLogin.id, {
                    hashedPassword: hashedPasswordAndSalt.hashedPassword,
                    salt: hashedPasswordAndSalt.salt,
                })
                    .then(() => {
                    resolve(true);
                })
                    .catch((updateLocalLoginError) => {
                    reject(new BlError("localLogin could not be updated").add(updateLocalLoginError));
                });
            })
                .catch((hashPasswordError) => {
                reject(hashPasswordError);
            });
        })
            .catch((getLocalLoginError) => {
            reject(new BlError(`localLogin was not found with username "${username}"`)
                .code(702)
                .add(getLocalLoginError));
        });
    });
}
function add(localLogin) {
    return new Promise((resolve, reject) => {
        const blError = new BlError("")
            .className("LocalLoginHandler")
            .methodName("add");
        if (!localLogin.username || localLogin.username.length <= 0)
            return reject(blError.msg("username of LocalLogin needs to be provided"));
        if (!localLogin.provider || localLogin.provider.length <= 0)
            return reject(blError.msg("provider of LocalLogin needs to be provided"));
        if (!localLogin.providerId || localLogin.providerId.length <= 0)
            return reject(blError.msg("providerId of LocalLogin needs to be provided"));
        if (!localLogin.hashedPassword || localLogin.hashedPassword.length <= 0)
            return reject(blError.msg("hashedPassword of LocalLogin needs to be provided"));
        if (!localLogin.salt || localLogin.salt.length <= 0)
            return reject(blError.msg("salt of LocalLogin needs to be provided"));
        if (!validator.isEmail(localLogin.username))
            return reject(blError.msg('username "' + localLogin.username + '" is not a valid email'));
        BlStorage.LocalLogins.add(localLogin)
            .then((localLogin) => {
            return resolve(localLogin);
        })
            .catch((error) => {
            return reject(error);
        });
    });
}
const LocalLoginHandler = {
    get,
    createDefaultLocalLoginIfNoneIsFound,
    createDefaultLocalLogin,
    setPassword,
    add,
};
export default LocalLoginHandler;
