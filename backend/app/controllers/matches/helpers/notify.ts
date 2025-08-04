import { Infer } from "@vinejs/vine/types";

import DispatchService from "#services/dispatch_service";
import { BlStorage } from "#services/storage/bl-storage";
import { EMAIL_TEMPLATES } from "#types/email_templates";
import { matchNotifySchema } from "#validators/matches";

export async function notify({
  target,
  message,
}: Infer<typeof matchNotifySchema>) {
  const userMatches = await BlStorage.UserMatches.getAll();
  const standMatches = await BlStorage.StandMatches.getAll();
  if (userMatches.length === 0 && standMatches.length === 0) {
    return "Could not find any matches!";
  }
  const userMatchCustomers = new Set<string>();
  for (const userMatch of userMatches) {
    userMatchCustomers.add(userMatch.customerA);
    userMatchCustomers.add(userMatch.customerB);
  }
  const standMatchCustomers = new Set<string>();
  for (const standMatch of standMatches) {
    standMatchCustomers.add(standMatch.customer);
  }
  const standMatchOnlyCustomers =
    standMatchCustomers.difference(userMatchCustomers);

  let targetCustomerIds: Set<string>;
  switch (target) {
    case "user-matches": {
      targetCustomerIds = userMatchCustomers;
      break;
    }
    case "stand-only": {
      targetCustomerIds = standMatchOnlyCustomers;
      break;
    }
    case "all":
    default: {
      targetCustomerIds = userMatchCustomers.union(standMatchCustomers);
      break;
    }
  }
  const targetCustomers = await BlStorage.UserDetails.getMany([
    ...targetCustomerIds,
  ]);

  const mailStatus = await DispatchService.sendEmail({
    template: EMAIL_TEMPLATES.matchNotify,
    recipients: targetCustomers.map((customer) => ({
      to: customer.email,
      dynamicTemplateData: {
        name: customer.name.split(" ")[0] ?? customer.name,
        username: customer.email,
      },
    })),
  });
  const smsStatus = await DispatchService.sendSMS(
    targetCustomers.map((customer) => ({
      to: customer.phone,
      body: `Hei, ${customer.name.split(" ")[0]}. ${message} Mvh Boklisten`,
    })),
  );
  return `Emails sent successfully? ${mailStatus.success} | SMS: ${smsStatus.successCount} successful, failed to send to ${smsStatus.failed.join(", ")}`;
}
