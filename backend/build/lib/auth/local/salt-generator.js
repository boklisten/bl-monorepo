import crypto from "node:crypto";
import { BlError } from "@shared/bl-error/bl-error.js";
function generate() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(256, (error, buffer) => {
            if (error)
                reject(new BlError("could not create random bytes")
                    .data(error)
                    .className("SaltGenerator")
                    .methodName("generate"));
            resolve(buffer.toString("hex"));
        });
    });
}
const SaltGenerator = {
    generate,
};
export default SaltGenerator;
