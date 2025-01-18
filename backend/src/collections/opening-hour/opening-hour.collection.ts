import { BlCollection } from "@backend/collections/bl-collection";
import { BlStorage } from "@backend/storage/bl-storage";

export const OpeningHourCollection: BlCollection = {
  storage: BlStorage.OpeningHours,
  endpoints: [
    {
      method: "getId",
    },
    {
      method: "getAll",
      validQueryParams: [
        {
          fieldName: "branch",
          type: "object-id",
        },
        {
          fieldName: "to",
          type: "date",
        },
        {
          fieldName: "from",
          type: "date",
        },
      ],
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
