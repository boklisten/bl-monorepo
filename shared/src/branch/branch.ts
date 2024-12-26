import { BlDocument } from "@shared/bl-document/bl-document";
import { BranchPaymentInfo } from "@shared/branch/branch-payment-info";
import { UserPermission } from "@shared/permission/user-permission";

export interface Branch extends BlDocument {
  name: string; // the name of the branch
  type?: string; // the type of branch, ex. School or Storage
  desc?: string; // the description of the branch
  root?: boolean; // is this a root branch
  openingHours?: string[]; // id of all the opening hours this branch has
  paymentInfo?: BranchPaymentInfo; // payment information for this branch
  viewableFor?: [UserPermission];
  contactInfo?: {
    // the contact info for the branch
    phone: number;
    email: string;
    address: string;
    postCode: string;
    postCity: string;
    country: string;
    locationDesc?: string; // description of how to get to the location, ex: 2nd floor up the elevator to the left
    location?: {
      // to place the location of this branch on a map
      latitude: string;
      longitude: string;
    };
  };
  deliveryMethods?: {
    branch?: boolean;
    byMail?: boolean;
  };
  isBranchItemsLive?: {
    // this object defines if the branchItems is live or not
    online: boolean; // if the branchItems is live online
    atBranch: boolean; // if the branchItems is live at branch (bladmin)
  };
  branchItems: string[]; // ids of/or the branchItems for this branch
  itemCategories?: [
    {
      // the item categories
      name: string; // the name of the category
      items: string[]; // the items this category have
    },
  ];
  location?: {
    region: string;
    address: string;
    postCode?: string;
    postCity?: string;
    description?: string;
    bookable?: boolean; // if it is possible to book time on this locaion
    map?: {
      latitude: string;
      lognitude: string;
    };
  };
}
