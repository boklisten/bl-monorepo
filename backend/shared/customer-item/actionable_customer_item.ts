interface ExtendAction {
  type: "extend";
  available: boolean;
  tooltip: string;
  buttonText: string;
}

interface BuyoutAction {
  type: "buyout";
  available: boolean;
  tooltip: string;
  buttonText: string;
}

export type CustomerItemStatus =
  | { type: "returned"; text: "Returnert" }
  | { type: "buyout"; text: "Kjøpt ut" }
  | { type: "active"; text: "Aktiv" }
  | { type: "overdue"; text: "Fristen har utløpt" };

export interface ActionableCustomerItem {
  id: string;
  item: {
    title: string;
    isbn: string;
  };
  blid: string | undefined;
  deadline: Date;
  handoutAt: Date | undefined;
  branchName: string;
  status: CustomerItemStatus;
  actions: [ExtendAction, BuyoutAction];
}
