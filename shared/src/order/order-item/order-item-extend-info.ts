import { Period } from "@shared/period/period.js";

export interface OrderItemExtendInfo {
  from: Date;
  to: Date;
  numberOfPeriods: 1;
  periodType: Period;
  customerItem: string; // the id of the customer item
}
