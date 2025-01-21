import { BlEnv } from "@backend/config/env.js";
import { logger } from "@backend/config/logger.js";
import twilio from "twilio";

const client = twilio(BlEnv.TWILIO_SMS_SID, BlEnv.TWILIO_SMS_AUTH_TOKEN, {
  autoRetry: true,
  maxRetries: 5,
});

/**
 * Send a single SMS to a single recipient
 * @param toNumber Norwegian phone number (without country code)
 * @param message The message to be sent, must be less than 280 characters
 */
export async function sendSMS(
  toNumber: string,
  message: string,
): Promise<void> {
  try {
    await client.messages.create({
      body: message,
      to: `+47${toNumber}`,
      from: "Boklisten",
    });
    logger.info(`successfully sent SMS to "${toNumber}"`);
  } catch (error) {
    logger.error(`failed to send SMS to "${toNumber}", reason: ${error}`);
    throw error;
  }
}

/**
 * Send SMS to a multiple receivers
 * @param toNumbers the Norwegian numbers to receive the message
 * @param message the message to be sent
 */
export async function massSendSMS(
  toNumbers: string[],
  message: string,
): Promise<PromiseSettledResult<Awaited<Promise<void>>>[]> {
  return Promise.allSettled(
    toNumbers.map((toNumber) => sendSMS(toNumber, message)),
  );
}
