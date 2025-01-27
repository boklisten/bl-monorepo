import { Schema } from "mongoose";

import { BlModel } from "#services/storage/bl-storage";
import { ItemModel } from "#services/storage/models/item.model";
import { UserDetailModel } from "#services/storage/models/user-detail.model";
import { StandMatch } from "#shared/match/stand-match";

const { ObjectId } = Schema.Types;

export const StandMatchModel: BlModel<StandMatch> = {
  name: "stand_matches",
  schema: new Schema({
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
