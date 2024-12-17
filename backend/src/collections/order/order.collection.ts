import {
  BlCollection,
  BlCollectionName,
  BlDocumentPermission,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { OrderPatchHook } from "@backend/collections/order/hooks/order.patch.hook";
import { OrderPostHook } from "@backend/collections/order/hooks/order.post.hook";
import { OrderConfirmOperation } from "@backend/collections/order/operations/confirm/order-confirm.operation";
import { OrderAgreementPdfOperation } from "@backend/collections/order/operations/order-agreement-pdf.operation";
import { OrderReceiptPdfOperation } from "@backend/collections/order/operations/order-receipt-pdf.operation";
import { OrderPlaceOperation } from "@backend/collections/order/operations/place/order-place.operation";
import { RapidHandoutOperation } from "@backend/collections/order/operations/rapid-handout.operation";
import { orderSchema } from "@backend/collections/order/order.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";

export class OrderCollection implements BlCollection {
  collectionName = BlCollectionName.Orders;
  mongooseSchema = orderSchema;
  documentPermission: BlDocumentPermission = {
    viewableForPermission: "employee",
  };
  endpoints: BlEndpoint[] = [
    {
      method: "post",
      hook: new OrderPostHook(),
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
        restricted: true,
      },
      operations: [
        {
          name: "rapid-handout",
          operation: new RapidHandoutOperation(),
          restriction: {
            permissions: ["employee", "manager", "admin", "super"],
          },
        },
      ],
    },
    {
      method: "delete",
      restriction: {
        permissions: ["admin", "super"],
      },
    },
    {
      method: "patch",
      hook: new OrderPatchHook(),
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
        restricted: true,
      },
      operations: [
        {
          name: "place",
          operation: new OrderPlaceOperation(),
          restriction: {
            permissions: ["employee", "manager", "admin", "super"],
            restricted: true,
          },
        },
        {
          name: "confirm",
          operation: new OrderConfirmOperation(),
          restriction: {
            permissions: ["customer", "employee", "manager", "admin", "super"],
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
          mongooseSchema: userDetailSchema,
          collection: BlCollectionName.UserDetails,
        },
      ],
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
        restricted: true,
      },
      operations: [
        {
          name: "receipt",
          operation: new OrderReceiptPdfOperation(),
          restriction: {
            permissions: ["customer", "employee", "manager", "admin", "super"],
            restricted: true,
          },
        },
        {
          name: "agreement",
          operation: new OrderAgreementPdfOperation(),
          restriction: {
            permissions: ["customer", "employee", "manager", "admin", "super"],
            restricted: true,
          },
        },
      ],
    },
    {
      method: "getAll",
      restriction: {
        permissions: ["employee", "manager", "admin", "super"],
      },
      nestedDocuments: [
        {
          field: "customer",
          collection: BlCollectionName.UserDetails,
          mongooseSchema: userDetailSchema,
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
  ];
}
