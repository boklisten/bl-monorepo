import crypto from "node:crypto";

import { BlError } from "#shared/bl-error/bl-error";

function cipher(message: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (message.length <= 0)
      reject(
        new BlError("msg to short").className("BlCrypto").methodName("cipher"),
      );

    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    const encrypted = cipher.update(message);
    resolve(Buffer.concat([encrypted, cipher.final()]).toString("hex"));
  });
}

function hash(message: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const blError = new BlError("").className("BlCrypto").methodName("hash");

    if (!message || message.length <= 0)
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

    cryptoHash.write(message + salt);

    cryptoHash.end();
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function random(): string {
  return crypto.randomBytes(20).toLocaleString("hex");
}

const BlCrypto = {
  cipher,
  hash,
  timingSafeEqual,
  random,
};

export default BlCrypto;
