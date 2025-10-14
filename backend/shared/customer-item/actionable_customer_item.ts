export type CustomerItemStatus =
  | { type: "returned"; text: "Returnert" }
  | { type: "buyout"; text: "Kjøpt ut" }
  | { type: "active"; text: "Aktiv" }
  | { type: "overdue"; text: "Fristen har utløpt" };
