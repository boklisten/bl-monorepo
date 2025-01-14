import { BlCollection } from "@backend/collections/bl-collection";
import { OpeningHourModel } from "@backend/collections/opening-hour/opening-hour.model";

export const OpeningHourCollection: BlCollection = {
  model: OpeningHourModel,
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
