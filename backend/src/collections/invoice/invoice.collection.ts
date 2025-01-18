import { BlCollection } from "@backend/collections/bl-collection";
import { BlStorage } from "@backend/storage/bl-storage";

export const InvoiceCollection: BlCollection = {
  storage: BlStorage.Invoices,
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
