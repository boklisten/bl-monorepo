import hash from "@adonisjs/core/services/hash";

import BlCrypto from "#services/config/bl-crypto";
import { BlStorage } from "#services/storage/bl-storage";

export const PasswordService = {
  async hash(text: string) {
    return await hash.make(text);
  },
  async setPassword(userId: string, password: string) {
    await BlStorage.Users.update(userId, {
      "login.local.hashedPassword": await this.hash(password),
      "login.local.salt": undefined, // fixme: Legacy, only used for the old sha256 hashing, remove when most of our hashes have been converted to argon2
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
      const candidate = await BlCrypto.hash(password, salt ?? "");
      if (!BlCrypto.timingSafeEqual(candidate, hashedPassword)) return false;
      await this.setPassword(userId, password);
      return true;
    }

    return await hash.verify(hashedPassword, password);
  },
};
