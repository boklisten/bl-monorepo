import {
  BlCollection,
  BlCollectionName,
  BlDocumentPermission,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { PaymentGetAllHook } from "@backend/collections/payment/hooks/payment.get-all.hook";
import { PaymentPatchHook } from "@backend/collections/payment/hooks/payment.patch.hook";
import { PaymentPostHook } from "@backend/collections/payment/hooks/payment.post.hook";
import { paymentSchema } from "@backend/collections/payment/payment.schema";

export class PaymentCollection implements BlCollection {
  public collectionName = BlCollectionName.Payments;
  public mongooseSchema = paymentSchema;
  documentPermission: BlDocumentPermission = {
    viewableForPermission: "employee",
  };
  public endpoints: BlEndpoint[] = [
    {
      method: "post",
      hook: new PaymentPostHook(),
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
        restricted: true,
      },
    },
    {
      method: "getAll",
      hook: new PaymentGetAllHook(),
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
        restricted: true,
      },
      validQueryParams: [
        { fieldName: "confirmed", type: "boolean" },
        { fieldName: "creationTime", type: "date" },
        { fieldName: "branch", type: "string" },
        { fieldName: "method", type: "string" },
        { fieldName: "info.paymentId", type: "string" },
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
      hook: new PaymentPatchHook(),
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
        restricted: true,
      },
    },
    {
      method: "delete",
      restriction: {
        permissions: ["admin", "super"],
      },
    },
  ];
}
