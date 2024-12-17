import { PaymentInfoCash } from "./payment-info-cash";
import { PaymentInfoCard } from "./payment-info-card";
import { PaymentInfoDibs } from "./payment-info-dibs";
import { PaymentInfoVipps } from "./payment-info-vipps";
import { PaymentInfoLater } from "./payment-info-later";
import { PaymentInfoCashout } from "./payment-info-cashout";
import { PaymentInfoBranch } from "./payment-info-branch";

export type PaymentInfo =
  | PaymentInfoCash
  | PaymentInfoCard
  | PaymentInfoDibs
  | PaymentInfoVipps
  | PaymentInfoLater
  | PaymentInfoCashout
  | PaymentInfoBranch;
