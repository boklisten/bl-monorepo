import { BlCollection } from "@backend/collections/bl-collection";
import { MessagePostHook } from "@backend/collections/message/hooks/message-post.hook";
import { SendgridEventOperation } from "@backend/collections/message/operations/sendgrid-event.operation";
import { TwilioSmsEventOperation } from "@backend/collections/message/operations/twillio-sms-event.operation";
import { BlStorage } from "@backend/storage/bl-storage";

export const MessageCollection: BlCollection = {
  storage: BlStorage.Messages,
  endpoints: [
    {
      method: "post",
      hook: new MessagePostHook(),
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
