import { createHash, timingSafeEqual } from "node:crypto";

import hash from "@adonisjs/core/services/hash";

import { BlStorage } from "#services/storage/bl-storage";

export const PasswordService = {
  async hash(text: string) {
    return await hash.make(text);
  },
  async setPassword(userId: string, password: string) {
    await BlStorage.Users.update(userId, {
      $set: {
        "login.local.hashedPassword": await this.hash(password),
      },
      $unset: {
        "login.local.salt": "", // fixme: Legacy, only used for the old sha256 hashing, remove when most of our hashes have been converted to argon2
      },
    });
  },
  async verifyPassword({
    userId,
    password,
    hashedPassword,
    salt,
  }: {
    userId: string;
    password: string;
    hashedPassword: string;
    salt?: string | undefined;
  }) {
    // fixme: Legacy code to convert old sha256 hashes to argon2. Remove this logic when most of our hashes have been converted to argon2
    if (!hash.isValidHash(hashedPassword)) {
      const candidateHash = createHash("sha256")
        .update(password + salt)
        .digest();
      const storedHash = Buffer.from(hashedPassword, "hex");
      if (!timingSafeEqual(candidateHash, storedHash)) return false;
      await this.setPassword(userId, password);
      return true;
    }

    return await hash.verify(hashedPassword, password);
  },
};
