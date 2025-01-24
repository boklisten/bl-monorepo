import crypto from "node:crypto";
import BlCrypto from "@backend/lib/config/bl-crypto.js";
import { BlError } from "@shared/bl-error/bl-error.js";
function generate(username) {
    return new Promise((resolve, reject) => {
        const blError = new BlError("")
            .className("ProviderIdGenerator")
            .methodName("generate");
        if (!username || username.length <= 0)
            reject(blError.msg("username is empty or undefined"));
        crypto.randomBytes(32, (error, buffer) => {
            if (error)
                reject(blError.msg("could not generate random bytes").data(error));
            BlCrypto.hash(username, buffer.toString("hex")).then((hashedMessage) => {
                resolve(hashedMessage);
            }, (error) => {
                reject(error.add(blError.msg("could not hash the provided username and salt")));
            });
        });
    });
}
const ProviderIdGenerator = {
    generate,
};
export default ProviderIdGenerator;
