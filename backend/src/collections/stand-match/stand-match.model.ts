import { BlModel } from "@backend/collections/bl-collection";
import { ItemModel } from "@backend/collections/item/item.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { StandMatch } from "@shared/match/stand-match";
import { Schema } from "mongoose";

const { ObjectId } = Schema.Types;

export const StandMatchModel: BlModel<StandMatch> = {
  name: "stand_matches",
  schema: new Schema<ToSchema<StandMatch>>({
    customer: {
      type: ObjectId,
      required: true,
      ref: UserDetailModel.name,
    },
    expectedHandoffItems: {
      type: [ObjectId],
      required: true,
      ref: ItemModel.name,
    },
    expectedPickupItems: {
      type: [ObjectId],
      required: true,
      ref: ItemModel.name,
    },
    receivedItems: {
      type: [ObjectId],
      default: [],
      ref: ItemModel.name,
    },
    deliveredItems: {
      type: [ObjectId],
      default: [],
      ref: ItemModel.name,
    },
    meetingInfo: {
      location: { type: String, required: true },
      date: { type: Date },
    },
  }),
};
