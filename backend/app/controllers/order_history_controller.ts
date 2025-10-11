import { HttpContext } from "@adonisjs/core/http";

import { SEDbQuery } from "#services/legacy/query/se.db-query";
import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { TranslationService } from "#services/translation_service";

export default class OrderHistoryController {
  async getMyOrders(ctx: HttpContext) {
    const { detailsId } = PermissionService.authenticate(ctx);
    const databaseQuery = new SEDbQuery();
    databaseQuery.objectIdFilters = [
      { fieldName: "customer", value: detailsId },
    ];
    databaseQuery.booleanFilters = [{ fieldName: "placed", value: true }];
    databaseQuery.sortFilters = [{ fieldName: "creationTime", direction: -1 }];
    const orders = await StorageService.Orders.getByQueryOrNull(databaseQuery);
    return await Promise.all(
      orders?.map(async (order) => {
        const branch = await StorageService.Branches.getOrNull(order.branch);
        const payments = (
          await Promise.all(
            (order.payments ?? []).map((payment) =>
              StorageService.Payments.getOrNull(payment),
            ),
          )
        )
          .filter((payment) => !!payment)
          .map((payment) => ({
            id: payment.id,
            methodLabel: TranslationService.translatePaymentMethod(
              payment.method,
            ),
            amount: payment.amount,
            confirmed: payment.confirmed,
          }));

        return {
          ...order,
          orderItems: order.orderItems.map((orderItem) => ({
            ...orderItem,
            typeLabel: TranslationService.translateOrderItemType(
              orderItem.type,
            ),
          })),
          branchName: branch?.name,
          payments,
        };
      }) ?? [],
    );
  }
}
