import { EmailVerificationSchema } from "#database/schema";
import { beforeCreate } from "@adonisjs/lucid/orm";

export default class EmailVerification extends EmailVerificationSchema {
  @beforeCreate()
  static createUUID(emailVerification: EmailVerification) {
    emailVerification.id = crypto.randomUUID();
  }
}
