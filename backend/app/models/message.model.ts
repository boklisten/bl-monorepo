import { Schema } from "mongoose";

import { BlModel } from "#services/storage/bl-storage";
import { Message } from "#shared/message/message";

export const MessageModel: BlModel<Message> = {
  name: "messages",
  schema: new Schema({
    messageType: {
      type: String,
      required: true,
    },
    messageSubtype: {
      type: String,
      required: true,
    },
    messageMethod: {
      type: String,
      required: true,
    },
    sequenceNumber: {
      type: Number,
      default: 0,
    },
    customerId: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      required: false,
    },
    info: {
      type: Schema.Types.Mixed,
      required: false,
    },
    subject: {
      type: String,
      required: false,
    },
    htmlContent: {
      type: String,
      required: false,
    },
    events: [Schema.Types.Mixed],

    smsEvents: [Schema.Types.Mixed],
    textBlocks: [Schema.Types.Mixed],
  }),
};
