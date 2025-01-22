import { BlModel } from "@backend/express/storage/bl-storage.js";
import { ItemModel } from "@backend/express/storage/models/item.model.js";
import { UserDetailModel } from "@backend/express/storage/models/user-detail.model.js";
import { UserMatch } from "@shared/match/user-match.js";
import { Schema } from "mongoose";

const { ObjectId } = Schema.Types;

export const UserMatchModel: BlModel<UserMatch> = {
  name: "user_matches",
  schema: new Schema({
    customerA: {
      type: ObjectId,
      required: true,
      ref: UserDetailModel.name,
    },
    customerB: {
      type: ObjectId,
      required: true,
      ref: UserDetailModel.name,
    },
    expectedAToBItems: {
      type: [ObjectId],
      required: true,
      ref: ItemModel.name,
    },
    expectedBToAItems: {
      type: [ObjectId],
      required: true,
      ref: ItemModel.name,
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
  }),
};
