import { Period } from "@shared/period/period.js";

export interface OrderItemBuybackInfo {
  buybackAmount?: number; // the amount the employee pays to buyback
  customerItem?: string;
  from?: Date;
  to?: Date;
  numberOfPeriods?: number;
  periodType?: Period;
}
