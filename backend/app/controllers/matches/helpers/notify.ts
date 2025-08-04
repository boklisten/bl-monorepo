import { Infer } from "@vinejs/vine/types";

import DispatchService from "#services/dispatch_service";
import { StorageService } from "#services/storage_service";
import { matchNotifySchema } from "#validators/matches";

export async function notify({
  target,
  message,
}: Infer<typeof matchNotifySchema>) {
  const userMatches = await StorageService.UserMatches.getAll();
  const standMatches = await StorageService.StandMatches.getAll();
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
  const targetCustomers = await StorageService.UserDetails.getMany([
    ...targetCustomerIds,
  ]);
  const { mailStatus, smsStatus } = await DispatchService.sendMatchInformation({
    customers: targetCustomers,
    smsBody: message,
  });

  return `Emails sent successfully? ${mailStatus.success} | SMS: ${smsStatus.successCount} successful, failed to send to ${smsStatus.failed.join(", ")}`;
}
