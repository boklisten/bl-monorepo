import { BlDocument } from "../bl-document/bl-document";
import { Period } from "../period/period";
import { UserDetail } from "../user/user-detail/user-detail";
import { SharedItem } from "../shared-item/shared-item";
import { Order } from "../order/order";
import { Item } from "../item/item";
import { CustomerItemType } from "./customer-item-type";

/**
 * A CustomerItem is a item that the customer is holding, either by renting
 * or by only payed part of full amout (partly payment).
 * It holds information about the rental period such as the deadline.
 * it can either be handed out by a Branch or another Customer.
 */
export class CustomerItem extends BlDocument {
  item: string; // what item is this customerItem for
  blid?: string; // the unique id for this customer item
  type?: CustomerItemType; // type is used to determine how to handle the customerItem
  age?: "new" | "used"; // describes if the item is new or used
  customer: string; // the id/or the customer
  sharedItem?: string; // can point to a shared item, if so the item has a unique id and can be traced
  deadline: Date; //the deadline to return (or buyout if type is "partly-payment") this item
  status?: "rent" | "cancel" | "buy"; // status of the customerItem
  digital?: boolean; // if the customerItem is digital
  digitalInfo?: {
    id?: string;
  };
  match?: boolean;
  matchInfo?: {
    id?: string;
    time?: Date;
  };
  handout: boolean; // if this customerItem is handed out to customer or not
  handoutInfo?: {
    handoutBy: "branch" | "customer"; // if this was handed out by another customer or a branch
    handoutById: string; // the id of the branch or customer that handed out the item
    handoutEmployee?: string; // if at branch, this is the id of the employee that handed out the item
    time: Date; // the time this item was handed out
  };

  returned: boolean; // if this item is returned or not
  returnInfo?: {
    returnedTo: "branch" | "customer"; //if the item was returned to a branch or a customer
    returnedToId: string; // if returnedTo a branch, this is the id of a branch, otherwise a customer
    returnEmployee?: string; // if it was returned to a branch, this is the id of the employee
    time: Date; //the time of return
  };

  buyout?: boolean; // if customerItem was bought out this is set to true
  buyoutInfo?: {
    order?: string; // the id of the order made when buyout
    time?: Date;
  };

  cancel?: boolean;
  cancelInfo?: {
    order?: string;
    time: Date;
  };

  buyback?: boolean;
  buybackInfo?: {
    order: string;
  };

  orders?: string[]; // what orders are this customerItem a part of, must be at least one, the order placement

  //--------- When type is "partly-payment"
  // when the deadline is approaching the customer can buyout the item
  // the amount to pay on buyout is the amount in "amountLeftToPay"
  amountLeftToPay?: number; // the amount left to pay on this customerItem (only if type is partly-payment),
  totalAmount?: number; // the total amount that should be payed (only if type is partly-payent)
  // ---------

  periodExtends?: {
    from: Date; // the old deadline
    to: Date; // the new deadline
    periodType: Period; //what type of period this extend is
    time: Date; // time this extend was made
  }[];

  customerInfo?: {
    // the customer info that was available at creation (this info can not be changed)
    name: string;
    phone: string;
    address: string;
    postCode: string;
    postCity: string;
    dob: Date;
    guardian?: {
      name: string;
      phone: string;
      email: string;
    };
  };
}
