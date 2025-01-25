import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#services/types/bl-collection";

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
