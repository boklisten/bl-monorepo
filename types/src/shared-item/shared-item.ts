import { BlDocument } from "../bl-document/bl-document";

/**
 * A SharedItem is a duplicate of a item with a unique id so it can be traced through the system.
 * It can only be one item, but many sharedItems can point to one item.
 */
export class SharedItem extends BlDocument {
  item: string; // the item this shared item is a "duplicate" of
  currentlyHeldBy: "branch" | "customer"; // is it currently held by a customer or a branch
  currentlyHeldById: string; //if it is held by a branch this is the id of the branch, otherwise for a customer
  customerItem?: string; // if it is currently held by a customer, this points to a customerItem
  handoutInfo: {
    handoutBy: "branch" | "customer"; // did this SharedItem got handed to the customer by a branch or another customer
    handoutById: string; // if handoutBy is "branch" this id is for branch, otherwise for customer
    customerItem: string; // what customerItem represent this sharedItem
    time: Date; // at what time was the handout
  }[];
  returnInfo: {
    returnedTo: "branch" | "customer"; //did the sharedItem got delivered to a customer or to a branch
    returnedToId: string; //if returnedTo is branch, this is id of branch, otherwise id of customer
    customerItem: string; //what customerItem this was
    time: Date; // the time of return
  }[];
  holderInfo: {
    holderType: "branch" | "customer"; // who holds the SharedItem now, a branch or a customer
    id: string; // if holderType is branch, this represents the id of branch, otherwise a id of customer
  };
}
