import type { HttpContext } from "@adonisjs/core/http";
import moment from "moment-timezone";

import { PermissionService } from "#services/permission_service";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { Branch } from "#shared/branch/branch";
import {
  ActionableCustomerItem,
  CustomerItemStatus,
} from "#shared/customer-item/actionable_customer_item";
import { CustomerItem } from "#shared/customer-item/customer-item";

function calculateDeadlineDateWithGracePeriod(deadline: Date): string {
  const now = moment();
  const month = now.format("MM");
  const year = now.format("YYYY");

  if (month === "12") {
    return `${year}-12-31`;
  }
  if (month === "1") {
    const lastYear = now.subtract(1, "year").format("YYYY");
    return `${lastYear}-12-31`;
  }

  return moment(deadline).format("YYYY-MM-DD");
}

function isHandedOutWithinTheLastTwoWeeks(customerItem: CustomerItem) {
  return moment().isSameOrBefore(
    moment(customerItem.creationTime).add(2, "weeks"),
  );
}

function isDeadlineWithGracePeriodExpired(customerItem: CustomerItem) {
  return (
    customerItem.deadline.getTime() <
    new Date(
      calculateDeadlineDateWithGracePeriod(customerItem.deadline),
    ).getTime()
  );
}

function branchHasExtensionsInTheFuture(
  originalDeadline: Date,
  branch: Branch,
): boolean {
  return (
    branch.paymentInfo?.extendPeriods.some(
      (extendPeriod) =>
        originalDeadline.getTime() < extendPeriod.date.getTime(),
    ) ?? false
  );
}

function hasBeenExtendedBefore(customerItem: CustomerItem) {
  return (customerItem.periodExtends ?? []).length > 0;
}

function calculateExtensionStatus(
  customerItem: CustomerItem,
  branch: Branch | null,
): { canExtend: boolean; feedback: string } {
  if (!branch)
    return {
      canExtend: false,
      feedback:
        "Fant ikke filialen som denne boka er utdelt på. Vennligst ta kontakt for hjelp",
    };

  if (isDeadlineWithGracePeriodExpired(customerItem))
    return {
      canExtend: false,
      feedback: "Fristen for å forlenge har utløpt",
    };

  if (!branchHasExtensionsInTheFuture(customerItem.deadline, branch))
    return {
      canExtend: false,
      feedback: "Denne filialen tilbyr for øyeblikket ikke forlenging",
    };
  if (hasBeenExtendedBefore(customerItem))
    return {
      canExtend: false,
      feedback: "Denne bøken har allerede blitt forlenget",
    };
  return { canExtend: true, feedback: "" };
}

function calculateBuyoutStatus(customerItem: CustomerItem) {
  if (isDeadlineWithGracePeriodExpired(customerItem))
    return { canBuyout: false, feedback: "Fristen for å kjøpe ut har utløpt" };

  if (isHandedOutWithinTheLastTwoWeeks(customerItem))
    return {
      canBuyout: false,
      feedback: "Du må ha ha boken i minst 2 uker før du kan kjøpe den ut",
    };

  return { canBuyout: true, feedback: "" };
}

function calculateStatus(customerItem: CustomerItem): CustomerItemStatus {
  if (customerItem.buyout) return { type: "buyout", text: "Kjøpt ut" };
  if (customerItem.returned) return { type: "returned", text: "Returnert" };

  if (customerItem.deadline.getTime() < new Date().getTime())
    return { type: "overdue", text: "Fristen har utløpt" };

  return { type: "active", text: "Aktiv" };
}

export default class CustomerItemsController {
  async getCustomerItems(ctx: HttpContext): Promise<ActionableCustomerItem[]> {
    const { detailsId } = PermissionService.authenticate(ctx);
    const databaseQuery = new SEDbQuery();
    databaseQuery.stringFilters = [{ fieldName: "customer", value: detailsId }];
    databaseQuery.sortFilters = [{ fieldName: "lastUpdated", direction: -1 }];
    const customerItems =
      await BlStorage.CustomerItems.getByQuery(databaseQuery);
    return await Promise.all(
      customerItems.map(async (customerItem) => {
        const item = await BlStorage.Items.getOrNull(customerItem.item);
        const branch = await BlStorage.Branches.getOrNull(
          customerItem.handoutInfo?.handoutById,
        );
        const extensionStatus = calculateExtensionStatus(customerItem, branch);
        const buyoutStatus = calculateBuyoutStatus(customerItem);
        return {
          id: customerItem.id,
          item: {
            title: item?.title ?? "Ukjent tittel",
            isbn: item?.info.isbn.toString() ?? "",
          },
          blid: customerItem.blid,
          deadline: customerItem.deadline,
          handoutAt: customerItem.handoutInfo?.time,
          branchName: branch?.name ?? "",
          status: calculateStatus(customerItem),
          actions: [
            {
              type: "extend",
              available: extensionStatus.canExtend,
              tooltip: extensionStatus.feedback,
              buttonText: "Forleng",
            },
            {
              type: "buyout",
              available: buyoutStatus.canBuyout,
              tooltip: buyoutStatus.feedback,
              buttonText: "Kjøp ut",
            },
          ],
        };
      }),
    );
  }
}
