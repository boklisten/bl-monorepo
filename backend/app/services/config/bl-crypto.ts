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

function random(): string {
  return crypto.randomBytes(20).toLocaleString("hex");
}

const BlCrypto = {
  cipher,
  random,
};

export default BlCrypto;
