import { BlCollectionName } from "@backend/collections/bl-collection";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { StandMatch } from "@shared/match/stand-match";
import { Schema } from "mongoose";

const { ObjectId } = Schema.Types;

export const standMatchSchema = new Schema<ToSchema<StandMatch>>({
  customer: {
    type: ObjectId,
    ref: BlCollectionName.UserDetails,
  },
  // items which are expected to be handed off to stand
  expectedHandoffItems: {
    type: [ObjectId],
    ref: BlCollectionName.Items,
  },
  // items which are expected to be picked up from stand
  expectedPickupItems: {
    type: [ObjectId],
    ref: BlCollectionName.Items,
  },
  // items the customer has received from stand
  receivedItems: {
    type: [ObjectId],
    ref: BlCollectionName.Items,
  },
  // items the customer has handed off to stand
  deliveredItems: {
    type: [ObjectId],
    ref: BlCollectionName.Items,
  },
  meetingInfo: {
    location: { type: String, required: true },
    date: { type: Date },
  },
});
