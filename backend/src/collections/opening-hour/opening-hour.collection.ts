import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { openingHourSchema } from "@backend/collections/opening-hour/opening-hour.schema";

export class OpeningHourCollection implements BlCollection {
  collectionName = BlCollectionName.OpeningHours;
  mongooseSchema = openingHourSchema;
  endpoints: BlEndpoint[] = [
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
  ];
}
