import { Schema } from "mongoose";

import { BlSchemaName } from "#services/storage/bl-schema-names";
import { BlSchema } from "#services/storage_service";
import { StandMatch } from "#shared/match/stand-match";

const { ObjectId } = Schema.Types;

export const StandMatchSchema: BlSchema<StandMatch> = new Schema({
  customer: {
    type: ObjectId,
    required: true,
    ref: BlSchemaName.UserDetails,
  },
  expectedHandoffItems: {
    type: [ObjectId],
    required: true,
    ref: BlSchemaName.Items,
  },
  expectedPickupItems: {
    type: [ObjectId],
    required: true,
    ref: BlSchemaName.Items,
  },
  receivedItems: {
    type: [ObjectId],
    default: [],
    ref: BlSchemaName.Items,
  },
  deliveredItems: {
    type: [ObjectId],
    default: [],
    ref: BlSchemaName.Items,
  },
  meetingInfo: {
    location: { type: String, required: true },
    date: { type: Date },
  },
});
