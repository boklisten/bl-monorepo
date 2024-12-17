import crypto from "crypto";

import { BlError } from "@shared/bl-error/bl-error";

export class SeCrypto {
  public cipher(msg: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (msg.length <= 0)
        reject(
          new BlError("msg to short")
            .className("SeCrypto")
            .methodName("cipher"),
        );

      const key = crypto.randomBytes(32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
      const encrypted = cipher.update(msg);
      resolve(Buffer.concat([encrypted, cipher.final()]).toString("hex"));
    });
  }

  public hash(msg: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const blError = new BlError("").className("SeCrypto").methodName("hash");

      if (!msg || msg.length <= 0)
        return reject(blError.msg("msg is empty or undefined"));
      if (!salt || salt.length <= 0)
        return reject(blError.msg("salt is empty or undefined"));

      const cryptoHash = crypto.createHash("sha256");

      cryptoHash.on("readable", () => {
        const data = cryptoHash.read();
        if (data) {
          const hashedPassword = data.toString("hex");
          return resolve(hashedPassword);
        }
        return reject(blError.msg("could not hash the provided message"));
      });

      cryptoHash.write(msg + salt);

      cryptoHash.end();
    });
  }

  public timingSafeEqual(a: string, b: string): boolean {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }

  public random(): string {
    return crypto.randomBytes(20).toLocaleString("hex");
  }
}
