import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlCollection } from "@backend/types/bl-collection.js";

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
