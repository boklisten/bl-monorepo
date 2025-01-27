import crypto from "node:crypto";

import { BlError } from "#shared/bl-error/bl-error";

function generate(): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(256, (error: Error | null, buffer: Buffer) => {
      if (error)
        reject(
          new BlError("could not create random bytes")
            .data(error)
            .className("SaltGenerator")
            .methodName("generate"),
        );

      resolve(buffer.toString("hex"));
    });
  });
}

const SaltGenerator = {
  generate,
};

export default SaltGenerator;
