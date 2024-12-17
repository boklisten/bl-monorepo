import { CustomerItem } from "@boklisten/bl-model";

export class CustomerItemActive {
  public isActive(customerItem: CustomerItem): boolean {
    return !(
      customerItem.returned ||
      customerItem.buyout ||
      customerItem.cancel ||
      customerItem.buyback
    );
  }
}
