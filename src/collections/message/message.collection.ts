import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@/collections/bl-collection";
import { MessagePostHook } from "@/collections/message/hooks/message-post.hook";
import { messageSchema } from "@/collections/message/message.schema";
import { SendgridEventOperation } from "@/collections/message/operations/sendgrid-event.operation";
import { TwilioSmsEventOperation } from "@/collections/message/operations/twillio-sms-event.operation";

export class MessageCollection implements BlCollection {
  public collectionName = BlCollectionName.Messages;
  public mongooseSchema = messageSchema;
  public endpoints: BlEndpoint[] = [
    {
      method: "post",
      hook: new MessagePostHook(),
      restriction: {
        permissions: ["admin", "super"],
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
        permissions: ["employee", "admin", "super"],
      },
    },
    {
      method: "getId",
      restriction: {
        permissions: ["admin", "super"],
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
