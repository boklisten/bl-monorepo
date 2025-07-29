import { SendgridEventOperation } from "#services/legacy/collections/message/operations/sendgrid-event.operation";
import { TwilioSmsEventOperation } from "#services/legacy/collections/message/operations/twillio-sms-event.operation";
import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#services/types/bl-collection";

export const MessageCollection: BlCollection = {
  storage: BlStorage.Messages,
  endpoints: [
    {
      method: "post",
      restriction: {
        permission: "admin",
      },
      operations: [
        {
          name: "sendgrid-events",
          operation: new SendgridEventOperation(),
        },
        {
          name: "twilio-sms-events",
          operation: new TwilioSmsEventOperation(),
        },
      ],
    },
    {
      method: "getAll",
      validQueryParams: [
        {
          fieldName: "customerId",
          type: "string",
        },
      ],
      restriction: {
        permission: "employee",
      },
    },
    {
      method: "getId",
      restriction: {
        permission: "admin",
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
