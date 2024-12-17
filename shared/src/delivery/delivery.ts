import { BlDocument } from "../bl-document/bl-document";
import { DeliveryMethod } from "./delivery-method/delivery-method";
import { DeliveryInfoBring } from "./delivery-info/delivery-info-bring";
import { DeliveryInfoBranch } from "./delivery-info/delivery-info-branch";

export class Delivery extends BlDocument {
  method: DeliveryMethod; //method used for delivery
  info: DeliveryInfoBring | DeliveryInfoBranch; //specific info for the delivery type
  order: string; //id off/or the order
  amount: number; //total amount for this delivery
  taxAmount?: number;
}
