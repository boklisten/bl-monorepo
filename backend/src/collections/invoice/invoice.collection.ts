import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { invoiceSchema } from "@backend/collections/invoice/invoice.schema";

export class InvoiceCollection implements BlCollection {
  collectionName = BlCollectionName.Invoices;
  mongooseSchema = invoiceSchema;
  endpoints: BlEndpoint[] = [
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
  ];
}
