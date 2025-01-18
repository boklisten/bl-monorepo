import { BlCollection } from "@backend/collections/bl-collection";
import { PaymentGetAllHook } from "@backend/collections/payment/hooks/payment.get-all.hook";
import { PaymentPatchHook } from "@backend/collections/payment/hooks/payment.patch.hook";
import { PaymentPostHook } from "@backend/collections/payment/hooks/payment.post.hook";
import { BlStorage } from "@backend/storage/bl-storage";

export const PaymentCollection: BlCollection = {
  storage: BlStorage.Payments,
  documentPermission: {
    viewableForPermission: "employee",
  },
  endpoints: [
    {
      method: "post",
      hook: new PaymentPostHook(),
      restriction: {
        permission: "customer",
        restricted: true,
      },
    },
    {
      method: "getAll",
      hook: new PaymentGetAllHook(),
      restriction: {
        permission: "customer",
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
        permission: "customer",
        restricted: true,
      },
    },
    {
      method: "patch",
      hook: new PaymentPatchHook(),
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
