import { BlCollection } from "@backend/collections/bl-collection";
import { DeliveryPatchHook } from "@backend/collections/delivery/hooks/delivery.patch.hook";
import { DeliveryPostHook } from "@backend/collections/delivery/hooks/delivery.post.hook";
import { PostalCodeLookupOperation } from "@backend/collections/delivery/operations/postal-code-lookup.operation";
import { BlStorage } from "@backend/storage/bl-storage";

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
