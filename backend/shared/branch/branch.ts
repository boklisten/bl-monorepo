import { BlDocument } from "#shared/bl-document/bl-document";
import { BranchPaymentInfo } from "#shared/branch/branch-payment-info";

export interface Branch extends BlDocument {
  name: string; // the fully qualified name of the branch
  parentBranch?: string; // the ID of the parent branch for the current branch, if any e.g. Ullern Oslo
  localName?: string; // the name of this branch in relation to its parent and/or children. E.g. if the branch name is Ullern Oslo VG1, the localName is "VG1"
  childBranches?: string[]; // the IDs of the child branches, for instance Ullern VG1 ST
  type?: string; // the type of branch, privatist or vgs
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
