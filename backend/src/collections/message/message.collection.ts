import { BlCollection } from "@backend/collections/bl-collection";
import { MessagePostHook } from "@backend/collections/message/hooks/message-post.hook";
import { MessageModel } from "@backend/collections/message/message.model";
import { SendgridEventOperation } from "@backend/collections/message/operations/sendgrid-event.operation";
import { TwilioSmsEventOperation } from "@backend/collections/message/operations/twillio-sms-event.operation";

export const MessageCollection: BlCollection = {
  model: MessageModel,
  endpoints: [
    {
      method: "post",
      hook: new MessagePostHook(),
      restriction: {
        permissions: ["admin"],
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
        permissions: ["employee", "admin"],
      },
    },
    {
      method: "getId",
      restriction: {
        permissions: ["admin"],
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
