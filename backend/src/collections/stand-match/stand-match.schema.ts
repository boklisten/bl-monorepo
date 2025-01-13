import { BlCollectionName } from "@backend/collections/bl-collection";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { StandMatch } from "@shared/match/stand-match";
import { Schema } from "mongoose";

const { ObjectId } = Schema.Types;

export const standMatchSchema = new Schema<ToSchema<StandMatch>>({
  customer: {
    type: ObjectId,
    required: true,
    ref: BlCollectionName.UserDetails,
  },
  expectedHandoffItems: {
    type: [ObjectId],
    required: true,
    ref: BlCollectionName.Items,
  },
  expectedPickupItems: {
    type: [ObjectId],
    required: true,
    ref: BlCollectionName.Items,
  },
  receivedItems: {
    type: [ObjectId],
    default: [],
    ref: BlCollectionName.Items,
  },
  deliveredItems: {
    type: [ObjectId],
    default: [],
    ref: BlCollectionName.Items,
  },
  meetingInfo: {
    location: { type: String, required: true },
    date: { type: Date },
  },
});
