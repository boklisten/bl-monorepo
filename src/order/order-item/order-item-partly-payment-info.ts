import { Period } from "../../period/period";

export type OrderItemPartlyPaymentInfo = {
  from?: Date;
  to: Date; // the deadline for the next partly payment
  periodType: Period; // the type of period
  numberOfPeriods?: number;
  amountLeftToPay: number; // the amount left to pay on buyout of this item
  customerItem?: string;
};
