import { StorageService } from "#services/storage_service";
import { BranchItem } from "#shared/branch-item";
import { CartItemOption } from "#shared/cart_item";

export const CartService = {
  async getOptions(branchItem: BranchItem) {
    const [branch, item] = await Promise.all([
      StorageService.Branches.get(branchItem.branch),
      StorageService.Items.get(branchItem.item),
    ]);
    const options: CartItemOption[] = [];

    if (branchItem.rent) {
      for (const rentPeriod of branch.paymentInfo?.rentPeriods ?? []) {
        options.push({
          type: "rent",
          price: branch.paymentInfo?.responsible
            ? 0
            : Math.ceil(item.price * rentPeriod.percentage),
          to: rentPeriod.date,
        });
      }
    }

    if (branchItem.partlyPayment) {
      for (const partlyPaymentPeriod of branch.paymentInfo
        ?.partlyPaymentPeriods ?? []) {
        const priceUpFront = Math.ceil(
          item.price * partlyPaymentPeriod.percentageUpFront,
        );
        const priceLater = Math.ceil(item.price - priceUpFront);
        options.push({
          type: "partly-payment",
          price: branch.paymentInfo?.responsible ? 0 : priceUpFront,
          payLater: branch.paymentInfo?.responsible ? 0 : priceLater,
          to: partlyPaymentPeriod.date,
        });
      }
    }

    if (branchItem.buy) {
      options.push({
        type: "buy",
        price: branch.paymentInfo?.responsible ? 0 : Math.ceil(item.price),
      });
    }

    return options;
  },
};
