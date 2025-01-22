import BlCrypto from "@backend/express-config/bl-crypto.js";
import { BlError } from "@shared/bl-error/bl-error.js";

async function validate(
  password: string,
  salt: string,
  hashedPassword: string,
): Promise<boolean> {
  const blError = new BlError("")
    .className("LocalLoginPasswordValidator")
    .methodName("validate");

  if (!password || password.length <= 0)
    throw blError.msg("password is empty or undefined").code(901);
  if (!salt || salt.length <= 0)
    throw blError.msg("salt is empty or undefined");
  if (!hashedPassword || hashedPassword.length <= 0)
    throw blError.msg("hashedPassword is empty or undefined");

  let passwordAndSaltHashed;
  try {
    passwordAndSaltHashed = await BlCrypto.hash(password, salt);
  } catch {
    throw blError
      .msg("could not hash the provided password and salt")
      .code(901);
  }
  if (passwordAndSaltHashed === hashedPassword) {
    return true;
  }
  throw blError
    .msg("password and salt does not hash into the given hashedPassword")
    .code(901);
}

const LocalLoginPasswordValidator = {
  validate,
};

export default LocalLoginPasswordValidator;
