import { DeliveryPatchHook } from "#services/legacy/collections/delivery/hooks/delivery.patch.hook";
import { DeliveryPostHook } from "#services/legacy/collections/delivery/hooks/delivery.post.hook";
import { PostalCodeLookupOperation } from "#services/legacy/collections/delivery/operations/postal-code-lookup.operation";
import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#services/types/bl-collection";

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
