import { PaymentGetAllHook } from "@backend/lib/collections/payment/hooks/payment.get-all.hook.js";
import { PaymentPatchHook } from "@backend/lib/collections/payment/hooks/payment.patch.hook.js";
import { PaymentPostHook } from "@backend/lib/collections/payment/hooks/payment.post.hook.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export const PaymentCollection = {
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
