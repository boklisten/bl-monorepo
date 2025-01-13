import { BlCollectionName } from "@backend/collections/bl-collection";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { UserMatch } from "@shared/match/user-match";
import { Schema } from "mongoose";

const { ObjectId } = Schema.Types;

export const userMatchSchema = new Schema<ToSchema<UserMatch>>({
  customerA: {
    type: ObjectId,
    required: true,
    ref: BlCollectionName.UserDetails,
  },
  customerB: {
    type: ObjectId,
    required: true,
    ref: BlCollectionName.UserDetails,
  },
  expectedAToBItems: {
    type: [ObjectId],
    required: true,
    ref: BlCollectionName.Items,
  },
  expectedBToAItems: {
    type: [ObjectId],
    required: true,
    ref: BlCollectionName.Items,
  },
  receivedBlIdsCustomerA: {
    type: [String],
    default: [],
  },
  deliveredBlIdsCustomerA: {
    type: [String],
    default: [],
  },
  receivedBlIdsCustomerB: {
    type: [String],
    default: [],
  },
  deliveredBlIdsCustomerB: {
    type: [String],
    default: [],
  },

  itemsLockedToMatch: { type: Boolean, default: true },
  meetingInfo: {
    location: { type: String, required: true },
    date: { type: Date },
  },
});
