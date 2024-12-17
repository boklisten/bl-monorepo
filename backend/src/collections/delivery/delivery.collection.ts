import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { deliverySchema } from "@backend/collections/delivery/delivery.schema";
import { DeliveryPatchHook } from "@backend/collections/delivery/hooks/delivery.patch.hook";
import { DeliveryPostHook } from "@backend/collections/delivery/hooks/delivery.post.hook";
import { PostalCodeLookupOperation } from "@backend/collections/delivery/operations/postal-code-lookup.operation";

export class DeliveryCollection implements BlCollection {
  public collectionName = BlCollectionName.Deliveries;
  public mongooseSchema = deliverySchema;
  public endpoints: BlEndpoint[] = [
    {
      method: "post",
      hook: new DeliveryPostHook(),
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
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
        permissions: ["admin", "super"],
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
        permissions: ["customer", "employee", "manager", "admin", "super"],
        restricted: true,
      },
    },
    {
      method: "patch",
      hook: new DeliveryPatchHook(),
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
        restricted: true,
      },
    },
    {
      method: "delete",
      restriction: {
        permissions: ["admin"],
      },
    },
  ];
}
