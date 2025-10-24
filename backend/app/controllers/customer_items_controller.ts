import type { HttpContext } from "@adonisjs/core/http";
import moment from "moment-timezone";

import { DateService } from "#services/legacy/date.service";
import { SEDbQuery } from "#services/legacy/query/se.db-query";
import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { Branch } from "#shared/branch";
import { CustomerItemStatus } from "#shared/customer-item/actionable_customer_item";
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
    new Date().getTime() >
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
) {
  if (!branch)
    return {
      canExtend: false,
      feedback:
        "Fant ikke filialen som denne boka er utdelt på. Vennligst ta kontakt for hjelp",
    } as const;

  if (isDeadlineWithGracePeriodExpired(customerItem))
    return {
      canExtend: false,
      feedback: "Fristen for å forlenge har utløpt",
    } as const;

  if (!branchHasExtensionsInTheFuture(customerItem.deadline, branch))
    return {
      canExtend: false,
      feedback: "Denne filialen tilbyr for øyeblikket ikke forlenging",
    } as const;

  if (hasBeenExtendedBefore(customerItem))
    return {
      canExtend: false,
      feedback: "Denne bøken har allerede blitt forlenget",
    } as const;

  return {
    canExtend: true,
    feedback: "",
    options: branch.paymentInfo?.extendPeriods.map((extendPeriod) => ({
      date: extendPeriod.date,
      price: extendPeriod.price,
    })),
  } as const;
}

async function calculateBuyoutStatus(
  customerItem: CustomerItem,
  branch: Branch | null,
) {
  if (isDeadlineWithGracePeriodExpired(customerItem))
    return {
      canBuyout: false,
      feedback: "Fristen for å kjøpe ut har utløpt",
    } as const;

  if (isHandedOutWithinTheLastTwoWeeks(customerItem))
    return {
      canBuyout: false,
      feedback: "Du må ha ha boken i minst 2 uker før du kan kjøpe den ut",
    } as const;

  const item = await StorageService.Items.getOrNull(customerItem.item);
  const branchBuyoutPercentage = branch?.paymentInfo?.buyout?.percentage;
  if (!item || !branchBuyoutPercentage)
    return {
      canBuyout: false,
      feedback:
        "Klarte ikke beregne utkjøpspris. Vennligst ta kontakt hvis du vil kjøpe ut boka.",
    } as const;

  return {
    canBuyout: true,
    feedback: "",
    price: Math.ceil(item.price * branchBuyoutPercentage),
  } as const;
}

function calculateStatus(customerItem: CustomerItem): CustomerItemStatus {
  if (customerItem.buyout) return { type: "buyout", text: "Kjøpt ut" };
  if (customerItem.returned) return { type: "returned", text: "Returnert" };

  if (customerItem.deadline.getTime() < new Date().getTime())
    return { type: "overdue", text: "Fristen har utløpt" };

  return { type: "active", text: "Aktiv" };
}

export default class CustomerItemsController {
  async getCustomerItems(ctx: HttpContext) {
    const { detailsId } = PermissionService.authenticate(ctx);
    const databaseQuery = new SEDbQuery();
    databaseQuery.stringFilters = [{ fieldName: "customer", value: detailsId }];
    databaseQuery.sortFilters = [{ fieldName: "lastUpdated", direction: -1 }];
    const customerItems =
      await StorageService.CustomerItems.getByQueryOrNull(databaseQuery);
    if (!customerItems) return [];

    return await Promise.all(
      customerItems.map(async (customerItem) => {
        const item = await StorageService.Items.get(customerItem.item);
        const branch = await StorageService.Branches.get(
          customerItem.handoutInfo?.handoutById,
        );
        const extensionStatus = calculateExtensionStatus(customerItem, branch);
        const buyoutStatus = await calculateBuyoutStatus(customerItem, branch);
        return {
          id: customerItem.id,
          item: {
            id: item.id,
            title: item.title,
            isbn: item.info.isbn.toString(),
          },
          blid: customerItem.blid,
          deadline: customerItem.deadline,
          handoutAt: customerItem.handoutInfo?.time,
          branch: {
            id: branch.id,
            name: branch.name,
          },
          status: calculateStatus(customerItem),
          actions: [
            ...(extensionStatus.options?.map(
              (extension) =>
                ({
                  type: "extend",
                  price: extension.price,
                  to: extension.date,
                  available: true,
                  tooltip: "",
                  label: `Forleng til ${DateService.format(
                    extension.date,
                    "Europe/Oslo",
                    "DD/MM/YYYY",
                  )}`,
                }) as const,
            ) ?? [
              {
                type: "extend",
                available: false,
                price: 0,
                tooltip: extensionStatus.feedback,
                label: "Forleng",
              } as const,
            ]),
            {
              type: "buyout",
              price: buyoutStatus.price ?? 0,
              available: buyoutStatus.canBuyout,
              tooltip: buyoutStatus.feedback,
              label: "Kjøp ut",
            },
          ],
        } as const;
      }),
    );
  }
}
