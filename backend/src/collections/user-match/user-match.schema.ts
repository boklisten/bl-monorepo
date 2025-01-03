import { BlCollectionName } from "@backend/collections/bl-collection";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { UserMatch } from "@shared/match/user-match";
import { Schema } from "mongoose";

const { ObjectId } = Schema.Types;

export const userMatchSchema = new Schema<ToSchema<UserMatch>>({
  customerA: {
    type: {
      expectedHandoffItems: {
        type: [ObjectId],
        ref: BlCollectionName.Items,
      },
      expectedPickupItems: {
        type: [ObjectId],
        ref: BlCollectionName.Items,
      },
      deliveredBlIds: {
        type: [String],
      },
      receivedBlIds: {
        type: [String],
      },
    },
    required: true,
  },
  customerB: {
    type: {
      expectedHandoffItems: {
        type: [ObjectId],
        ref: BlCollectionName.Items,
      },
      expectedPickupItems: {
        type: [ObjectId],
        ref: BlCollectionName.Items,
      },
      deliveredBlIds: {
        type: [String],
      },
      receivedBlIds: {
        type: [String],
      },
    },
    required: true,
  },
  meetingInfo: {
    location: { type: String, required: true },
    date: { type: Date },
  },
});
