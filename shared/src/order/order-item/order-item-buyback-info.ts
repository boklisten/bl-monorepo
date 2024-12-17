import { Period } from "../../period/period";

export type OrderItemBuybackInfo = {
  buybackAmount?: number; // the amount the employee pays to buyback
  customerItem?: string;
  from?: Date;
  to?: Date;
  numberOfPeriods?: number;
  periodType?: Period;
};
