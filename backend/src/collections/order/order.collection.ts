import { BlCollection } from "@backend/collections/bl-collection";
import { OrderPatchHook } from "@backend/collections/order/hooks/order.patch.hook";
import { OrderPostHook } from "@backend/collections/order/hooks/order.post.hook";
import { BulkOrderOperation } from "@backend/collections/order/operations/bulk-order.operation";
import { OrderConfirmOperation } from "@backend/collections/order/operations/confirm/order-confirm.operation";
import { OrderAgreementPdfOperation } from "@backend/collections/order/operations/order-agreement-pdf.operation";
import { OrderReceiptPdfOperation } from "@backend/collections/order/operations/order-receipt-pdf.operation";
import { OrderPlaceOperation } from "@backend/collections/order/operations/place/order-place.operation";
import { RapidHandoutOperation } from "@backend/collections/order/operations/rapid-handout.operation";
import { BlStorage } from "@backend/storage/bl-storage";

export const OrderCollection: BlCollection = {
  storage: BlStorage.Orders,
  documentPermission: {
    viewableForPermission: "employee",
  },
  endpoints: [
    {
      method: "post",
      hook: new OrderPostHook(),
      restriction: {
        permission: "customer",
        restricted: true,
      },
      operations: [
        {
          name: "rapid-handout",
          operation: new RapidHandoutOperation(),
          restriction: {
            permission: "employee",
          },
        },
        /*
* fixme: Re-enable this when component is rewritten and generalized
*
        {
          name: "temp-bulk-create-orders",
          operation: new BulkOrderOperation(),
          restriction: {
            permission: "admin",
          },
        },
*/
      ],
    },
    {
      method: "delete",
      restriction: {
        permission: "admin",
      },
    },
    {
      method: "patch",
      hook: new OrderPatchHook(),
      restriction: {
        permission: "customer",
        restricted: true,
      },
      operations: [
        {
          name: "place",
          operation: new OrderPlaceOperation(),
          restriction: {
            permission: "employee",
            restricted: true,
          },
        },
        {
          name: "confirm",
          operation: new OrderConfirmOperation(),
          restriction: {
            permission: "customer",
            restricted: true,
          },
        },
      ],
    },
    {
      method: "getId",
      nestedDocuments: [
        {
          field: "customer",
          storage: BlStorage.UserDetails,
        },
      ],
      restriction: {
        permission: "customer",
        restricted: true,
      },
      operations: [
        {
          name: "receipt",
          operation: new OrderReceiptPdfOperation(),
          restriction: {
            permission: "customer",
            restricted: true,
          },
        },
        {
          name: "agreement",
          operation: new OrderAgreementPdfOperation(),
          restriction: {
            permission: "customer",
            restricted: true,
          },
        },
      ],
    },
    {
      method: "getAll",
      restriction: {
        permission: "employee",
      },
      nestedDocuments: [
        {
          field: "customer",
          storage: BlStorage.UserDetails,
        },
      ],
      validQueryParams: [
        {
          fieldName: "name",
          type: "string",
        },
        {
          fieldName: "placed",
          type: "boolean",
        },
        {
          fieldName: "byCustomer",
          type: "boolean",
        },
        {
          fieldName: "branch",
          type: "string",
        },
        {
          fieldName: "creationTime",
          type: "date",
        },
        {
          fieldName: "orderItems.delivered",
          type: "boolean",
        },
        {
          fieldName: "orderItems.handout",
          type: "boolean",
        },
        {
          fieldName: "orderItems.movedToOrder",
          type: "string",
        },
        {
          fieldName: "orderItems.type",
          type: "string",
        },
        {
          fieldName: "customer",
          type: "object-id",
        },
      ],
    },
  ],
};
