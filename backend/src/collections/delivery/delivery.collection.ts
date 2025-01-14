import { BlCollection } from "@backend/collections/bl-collection";
import { DeliveryModel } from "@backend/collections/delivery/delivery.model";
import { DeliveryPatchHook } from "@backend/collections/delivery/hooks/delivery.patch.hook";
import { DeliveryPostHook } from "@backend/collections/delivery/hooks/delivery.post.hook";
import { PostalCodeLookupOperation } from "@backend/collections/delivery/operations/postal-code-lookup.operation";

export const DeliveryCollection: BlCollection = {
  model: DeliveryModel,
  endpoints: [
    {
      method: "post",
      hook: new DeliveryPostHook(),
      restriction: {
        permissions: ["customer", "employee", "manager", "admin"],
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
        permissions: ["admin"],
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
        permissions: ["customer", "employee", "manager", "admin"],
        restricted: true,
      },
    },
    {
      method: "patch",
      hook: new DeliveryPatchHook(),
      restriction: {
        permissions: ["customer", "employee", "manager", "admin"],
        restricted: true,
      },
    },
    {
      method: "delete",
      restriction: {
        permissions: ["admin"],
      },
    },
  ],
};
