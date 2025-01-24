import HashedPasswordGenerator from "@backend/lib/auth/local/hashed-password-generator.js";
import ProviderIdGenerator from "@backend/lib/auth/local/provider-id-generator.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import validator from "validator";
function create(username, password) {
    return new Promise((resolve, reject) => {
        const blError = new BlError("")
            .className("LocalLoginCreator")
            .methodName("create");
        if (!username || !validator.isEmail(username))
            return reject(blError
                .msg('username "' + username + '" is undefined or not an Email')
                .code(103));
        if (!password || password.length < 6)
            return reject(blError.msg("password is to short or empty").code(103));
        HashedPasswordGenerator.generate(password).then((hashedPasswordAndSalt) => {
            ProviderIdGenerator.generate(username).then((providerId) => {
                resolve({
                    // @ts-expect-error fixme bad types
                    id: undefined,
                    username: username,
                    hashedPassword: hashedPasswordAndSalt.hashedPassword,
                    salt: hashedPasswordAndSalt.salt,
                    provider: "local",
                    providerId: providerId,
                });
            }, (providerIdGeneratorError) => {
                reject(blError
                    .msg("could not create providerId")
                    .add(providerIdGeneratorError));
            });
        }, (hashedPasswordGeneratorError) => {
            reject(blError
                .msg("could not create hashedPassword and salt")
                .add(hashedPasswordGeneratorError));
        });
    });
}
const LocalLoginCreator = {
    create,
};
export default LocalLoginCreator;
