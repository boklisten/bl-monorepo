import { BlDocument } from "#shared/bl-document";

export interface WaitingListEntry extends BlDocument {
  customerName: string;
  customerPhone: string;
  itemId: string;
  branchId: string;
}
