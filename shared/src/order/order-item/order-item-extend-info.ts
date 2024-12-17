import { Period } from "../../period/period";

export type OrderItemExtendInfo = {
  from: Date;
  to: Date;
  numberOfPeriods: 1;
  periodType: Period;
  customerItem: string; // the id of the customer item
};
