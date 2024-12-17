import crypto from "crypto";

import { BlError } from "@boklisten/bl-model";

export class SaltGenerator {
  public generate(): Promise<string> {
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
}
