import { OrderPatchHook } from "#services/legacy/collections/order/hooks/order.patch.hook";
import { OrderPostHook } from "#services/legacy/collections/order/hooks/order.post.hook";
import { OrderConfirmOperation } from "#services/legacy/collections/order/operations/confirm/order-confirm.operation";
import { GetCustomerOrdersOperation } from "#services/legacy/collections/order/operations/get-customer-orders.operation";
import { OrderAgreementPdfOperation } from "#services/legacy/collections/order/operations/order-agreement-pdf.operation";
import { OrderReceiptPdfOperation } from "#services/legacy/collections/order/operations/order-receipt-pdf.operation";
import { OrderPlaceOperation } from "#services/legacy/collections/order/operations/place/order-place.operation";
import { RapidHandoutOperation } from "#services/legacy/collections/order/operations/rapid-handout.operation";
import { StorageService } from "#services/storage_service";
import { BlCollection } from "#types/bl-collection";

export const OrderCollection: BlCollection = {
  storage: StorageService.Orders,
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
          storage: StorageService.UserDetails,
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
        {
          name: "get_customer_orders",
          operation: new GetCustomerOrdersOperation(),
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
          storage: StorageService.UserDetails,
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
