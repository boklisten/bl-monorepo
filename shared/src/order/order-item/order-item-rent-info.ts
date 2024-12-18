import { Period } from "@shared/period/period";

export interface OrderItemRentInfo {
  from: Date; //rent period start
  to: Date; //rent period end
  numberOfPeriods: number; //number of the period type given
  periodType: Period; //the period type, 'semester' means half year
  customerItem?: string; //an id of the customerItem this orderItem has become when the item is delivered to customer
}
