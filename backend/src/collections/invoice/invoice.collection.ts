import {
  BlCollection,
  BlCollectionName,
} from "@backend/collections/bl-collection";
import { invoiceSchema } from "@backend/collections/invoice/invoice.schema";

export const InvoiceCollection: BlCollection = {
  collectionName: BlCollectionName.Invoices,
  mongooseSchema: invoiceSchema,
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
