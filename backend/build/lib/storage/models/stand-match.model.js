import { ItemModel } from "@backend/lib/storage/models/item.model.js";
import { UserDetailModel } from "@backend/lib/storage/models/user-detail.model.js";
import { Schema } from "mongoose";
const { ObjectId } = Schema.Types;
export const StandMatchModel = {
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
