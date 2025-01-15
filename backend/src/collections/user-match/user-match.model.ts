import { BlModel } from "@backend/collections/bl-collection";
import { ItemModel } from "@backend/collections/item/item.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { UserMatch } from "@shared/match/user-match";
import { Schema } from "mongoose";

const { ObjectId } = Schema.Types;

export const UserMatchModel: BlModel<UserMatch> = {
  name: "user_matches",
  schema: new Schema<ToSchema<UserMatch>>({
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
