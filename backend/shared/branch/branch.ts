import { BlDocument } from "#shared/bl-document/bl-document";
import { BranchPaymentInfo } from "#shared/branch/branch-payment-info";

export interface Branch extends BlDocument {
  name: string; // the name of the branch
  type: string; // the type of branch, privatist or vgs
  allowMemberships?: boolean; // whether customers use this branch as their branchMembership
  parentBranch?: string; // the ID of the parent branch for the current branch, if any ex. Ullern Oslo
  childBranches?: string[]; // the IDs of the child branches ex. VG1, VG2, VG3
  openingHours?: string[]; // id of all the opening hours this branch has
  paymentInfo?: BranchPaymentInfo; // payment information for this branch
  deliveryMethods?: {
    branch?: boolean;
    byMail?: boolean;
  };
  isBranchItemsLive?: {
    // this object defines if the branchItems is live or not
    online?: boolean; // if the branchItems is live online
    atBranch?: boolean; // if the branchItems is live at branch (bladmin)
  };
  branchItems?: string[]; // ids of/or the branchItems for this branch
  location?: {
    region?: string;
    address?: string;
  };
}
