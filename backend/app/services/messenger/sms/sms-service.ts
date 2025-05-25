import logger from "@adonisjs/core/services/logger";
import twilio from "twilio";

import env from "#start/env";

const client = twilio(
  env.get("TWILIO_SMS_SID"),
  env.get("TWILIO_SMS_AUTH_TOKEN"),
  {
    autoRetry: true,
    maxRetries: 5,
  },
);

/**
 * Send a single SMS to a single recipient
 * @param toNumber Norwegian phone number (without country code)
 * @param message The message to be sent, must be less than 280 characters
 */
export async function sendSMS(toNumber: string, message: string) {
  try {
    await client.messages.create({
      body: message,
      to: `+47${toNumber}`,
      from: "Boklisten",
    });
    logger.info(`successfully sent SMS to "${toNumber}"`);
    return { success: true };
  } catch (error) {
    logger.error(`failed to send SMS to "${toNumber}", reason: ${error}`);
    return { success: false };
  }
}

/**
 * Send SMS to a multiple receivers
 * @param recipients pairs of phone number and intended messages
 */
export async function massSendSMS(
  recipients: { phone: string; message: string }[],
) {
  return await Promise.all(
    recipients.map(({ phone, message }) => sendSMS(phone, message)),
  );
}
