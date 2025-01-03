import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { branchSchema } from "@backend/collections/branch/branch.schema";
import { BranchGetHook } from "@backend/collections/branch/hook/branch-get.hook";
import { BranchPostHook } from "@backend/collections/branch/hook/branch-post.hook";

export class BranchCollection implements BlCollection {
  collectionName = BlCollectionName.Branches;
  mongooseSchema = branchSchema;
  endpoints: BlEndpoint[] = [
    {
      method: "getId",
      hook: new BranchGetHook(),
    },
    {
      method: "getAll",
      hook: new BranchGetHook(),
      validQueryParams: [
        {
          fieldName: "id",
          type: "string",
        },
        {
          fieldName: "name",
          type: "string",
        },
        {
          fieldName: "location.region",
          type: "string",
        },
        {
          fieldName: "location.bookable",
          type: "boolean",
        },
        {
          fieldName: "active",
          type: "boolean",
        },
        {
          fieldName: "location.address",
          type: "string",
        },
        {
          fieldName: "openingHours",
          type: "expand",
        },
      ],
    },
    {
      method: "post",
      hook: new BranchPostHook(),
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
