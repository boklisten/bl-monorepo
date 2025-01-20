import { CustomerItem } from "@shared/customer-item/customer-item.js";

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
