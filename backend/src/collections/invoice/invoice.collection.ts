import { BlCollection } from "@backend/collections/bl-collection.js";
import { BlStorage } from "@backend/storage/bl-storage.js";

export const InvoiceCollection: BlCollection = {
  storage: BlStorage.Invoices,
  endpoints: [
    {
      method: "getId",
      restriction: {
        permission: "admin",
      },
    },
    {
      method: "getAll",
      restriction: {
        permission: "admin",
      },
    },
    {
      method: "post",
      restriction: {
        permission: "admin",
      },
    },
    {
      method: "patch",
      restriction: {
        permission: "admin",
      },
    },
  ],
};
