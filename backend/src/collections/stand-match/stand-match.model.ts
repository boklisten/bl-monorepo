import { BlModelName, BlModel } from "@backend/collections/bl-collection";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { StandMatch } from "@shared/match/stand-match";
import { Schema } from "mongoose";

const { ObjectId } = Schema.Types;

export const StandMatchModel: BlModel<StandMatch> = {
  name: BlModelName.StandMatches,
  schema: new Schema<ToSchema<StandMatch>>({
    customer: {
      type: ObjectId,
      required: true,
      ref: BlModelName.UserDetails,
    },
    expectedHandoffItems: {
      type: [ObjectId],
      required: true,
      ref: BlModelName.Items,
    },
    expectedPickupItems: {
      type: [ObjectId],
      required: true,
      ref: BlModelName.Items,
    },
    receivedItems: {
      type: [ObjectId],
      default: [],
      ref: BlModelName.Items,
    },
    deliveredItems: {
      type: [ObjectId],
      default: [],
      ref: BlModelName.Items,
    },
    meetingInfo: {
      location: { type: String, required: true },
      date: { type: Date },
    },
  }),
};
