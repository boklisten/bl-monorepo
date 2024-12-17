import { BlDocument } from "../bl-document/bl-document";
import { OrderItem } from "./order-item/order-item";
import { Branch } from "../branch/branch";
import { UserDetail } from "../user/user-detail/user-detail";
import { Payment } from "../payment/payment";
import { Delivery } from "../delivery/delivery";

export class Order extends BlDocument {
  amount: number; // the total amount of this order
  orderItems: OrderItem[]; // orderitems for this order, needs to be at least one item
  branch: string; // the branch this order was added on
  customer: string; // the customer this order is for
  byCustomer: boolean; // if the customer added the order, if not an employee did
  employee?: string; // the employee that added the order, if at branch
  placed?: boolean; // the order is placed in store, only true if order, payments and delivery have met the criteria
  payments?: string[]; // ids of the payments this order has
  delivery?: string; // the id of the delivery object this order has
  handoutByDelivery?: boolean; // if set this order is a "handout by delivery" order aka items sent by mail
  notification?: {
    email: boolean; // if set to false, email should not be sent
  };
  // if set to false, the order is pending signature from customer or guardian and should not be
  //  acted on
  pendingSignature: boolean;
}
