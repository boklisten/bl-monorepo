import { DeliveryPatchHook } from "@backend/express/collections/delivery/hooks/delivery.patch.hook.js";
import { DeliveryPostHook } from "@backend/express/collections/delivery/hooks/delivery.post.hook.js";
import { PostalCodeLookupOperation } from "@backend/express/collections/delivery/operations/postal-code-lookup.operation.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { BlCollection } from "@backend/types/bl-collection.js";

export const DeliveryCollection: BlCollection = {
  storage: BlStorage.Deliveries,
  endpoints: [
    {
      method: "post",
      hook: new DeliveryPostHook(),
      restriction: {
        permission: "customer",
      },
      operations: [
        {
          name: "postal-code-lookup",
          operation: new PostalCodeLookupOperation(),
        },
      ],
    },
    {
      method: "getAll",
      restriction: {
        permission: "admin",
        restricted: true,
      },
      validQueryParams: [
        {
          fieldName: "creationTime",
          type: "date",
        },
      ],
    },
    {
      method: "getId",
      restriction: {
        permission: "customer",
        restricted: true,
      },
    },
    {
      method: "patch",
      hook: new DeliveryPatchHook(),
      restriction: {
        permission: "customer",
        restricted: true,
      },
    },
    {
      method: "delete",
      restriction: {
        permission: "admin",
      },
    },
  ],
};
