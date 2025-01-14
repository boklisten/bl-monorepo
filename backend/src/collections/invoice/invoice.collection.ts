import { BlCollection } from "@backend/collections/bl-collection";
import { InvoiceModel } from "@backend/collections/invoice/invoice.model";

export const InvoiceCollection: BlCollection = {
  model: InvoiceModel,
  endpoints: [
    {
      method: "getId",
      restriction: {
        permissions: ["admin"],
      },
    },
    {
      method: "getAll",
      restriction: {
        permissions: ["admin"],
      },
    },
    {
      method: "post",
      restriction: {
        permissions: ["admin"],
      },
    },
    {
      method: "patch",
      restriction: {
        permissions: ["admin"],
      },
    },
  ],
};
