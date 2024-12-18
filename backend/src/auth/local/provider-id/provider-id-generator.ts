import crypto from "node:crypto";

import { SeCrypto } from "@backend/crypto/se.crypto";
import { BlError } from "@shared/bl-error/bl-error";

export class ProviderIdGenerator {
  constructor(private seCrypto: SeCrypto) {}

  generate(username: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const blError = new BlError("")
        .className("ProviderIdGenerator")
        .methodName("generate");
      if (!username || username.length <= 0)
        reject(blError.msg("username is empty or undefined"));
      crypto.randomBytes(32, (error: Error | null, buffer: Buffer) => {
        if (error)
          reject(blError.msg("could not generate random bytes").data(error));

        this.seCrypto.hash(username, buffer.toString("hex")).then(
          (hashedMessage: string) => {
            resolve(hashedMessage);
          },
          (error: BlError) => {
            reject(
              error.add(
                blError.msg("could not hash the provided username and salt"),
              ),
            );
          },
        );
      });
    });
  }
}
