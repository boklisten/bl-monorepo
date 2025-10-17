import { BlDocument } from "#shared/bl-document";
import { DeliveryInfoBranch } from "#shared/delivery/delivery-info/delivery-info-branch";
import { DeliveryInfoBring } from "#shared/delivery/delivery-info/delivery-info-bring";
import { DeliveryMethod } from "#shared/delivery/delivery-method/delivery-method";

export interface Delivery extends BlDocument {
  method: DeliveryMethod; //method used for delivery
  info: DeliveryInfoBring | DeliveryInfoBranch; //specific info for the delivery type
  order: string; //id off/or the order
  amount: number; //total amount for this delivery
}
