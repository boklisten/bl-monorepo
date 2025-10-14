import type { HttpContext } from "@adonisjs/core/http";
import moment from "moment-timezone";

import { SEDbQuery } from "#services/legacy/query/se.db-query";
import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { TranslationService } from "#services/translation_service";
import {
  VippsCheckoutService,
  VippsOrderLine,
} from "#services/vipps_checkout_service";
import { initializeCheckoutValidator } from "#validators/checkout_validators";

export default class CheckoutController {
  // Currently only supporting extend and buyout
  async initializeCheckout(ctx: HttpContext) {
    const { detailsId } = PermissionService.authenticate(ctx);
    const { cartItems } = await ctx.request.validateUsing(
      initializeCheckoutValidator,
    );
    const databaseQuery = new SEDbQuery();
    databaseQuery.objectIdFilters = [
      {
        fieldName: "item",
        value: cartItems.map((cartItem) => cartItem.itemId),
      },
    ];
    databaseQuery.booleanFilters = [
      { fieldName: "returned", value: false },
      { fieldName: "buyout", value: false },
      { fieldName: "cancel", value: false },
    ];
    const customerItems =
      await StorageService.CustomerItems.getByQueryOrNull(databaseQuery);
    if (!customerItems) {
      throw new Error("No customer items found for checkout");
    }
    const orderLines = (await Promise.all(
      customerItems.map(async (customerItem) => {
        const [branch, item] = await Promise.all([
          StorageService.Branches.getOrNull(
            customerItem.handoutInfo?.handoutById,
          ),
          StorageService.Items.getOrNull(customerItem.item),
        ]);
        if (!branch || !item) {
          throw new Error("Unknown branch or item in checkout");
        }

        const cartItem = cartItems.find(
          (cartItem) => cartItem.itemId === customerItem.item,
        );
        if (!cartItem) {
          throw new Error(
            "Could not find cart item from customer item in checkout!",
          );
        }

        if (cartItem.type === "extend") {
          if (customerItem.periodExtends?.length !== 0) {
            throw new Error("Customer item already extended!");
          }
          const extendPeriods = branch.paymentInfo?.extendPeriods;
          if (!extendPeriods) {
            throw new Error("Branch has no extendPeriods in checkout");
          }
          const extendPeriod = extendPeriods.find(
            (extendPeriod) =>
              extendPeriod.date.getMilliseconds() ===
              cartItem.date?.getMilliseconds(),
          );
          if (!extendPeriod) {
            throw new Error("Extend period not found in checkout");
          }

          const totalPrice = extendPeriod.price * 100;
          return {
            id: item.id,
            name: `${item.title} - ${TranslationService.translateOrderItemTypeImperative(cartItem.type)} ${moment(cartItem.date).format("DD/MM/YYYY")}`,
            totalAmount: totalPrice,
            taxRate: item.taxRate,
            totalTaxAmount: totalPrice * item.taxRate,
            totalAmountExcludingTax: totalPrice - totalPrice * item.taxRate,
          };
        }

        const buyoutPercentage = branch.paymentInfo?.buyout?.percentage;
        if (!buyoutPercentage)
          throw new Error("Could not find buyout percentage in checkout!");

        const totalPrice = item.price * buyoutPercentage * 100;
        return {
          id: item.id,
          name: `${item.title} - ${TranslationService.translateOrderItemTypeImperative(cartItem.type)}`,
          totalAmount: totalPrice,
          taxRate: item.taxRate,
          totalTaxAmount: totalPrice * item.taxRate,
          totalAmountExcludingTax: totalPrice - totalPrice * item.taxRate,
        };
      }),
    )) satisfies VippsOrderLine[];

    const userDetail = await StorageService.UserDetails.getOrNull(detailsId);
    return await VippsCheckoutService.create({
      amount: orderLines.reduce((total, next) => total + next.totalAmount, 0),
      userDetail,
      orderLines,
    });
  }

  vippsCallback(ctx: HttpContext) {
    // TODO: handle potential raised errors checkout init or vipps in FE
    // TODO: handle callback, create order, etc
    // TODO: create proper return URl that shows either success or fail
    // TODO: maybe use polling URL for something (if needed)
    console.log(ctx.request.body());
  }
}
