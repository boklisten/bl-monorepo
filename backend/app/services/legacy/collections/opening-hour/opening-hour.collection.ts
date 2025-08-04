import { StorageService } from "#services/storage_service";
import { BlCollection } from "#types/bl-collection";

export const OpeningHourCollection: BlCollection = {
  storage: StorageService.OpeningHours,
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
