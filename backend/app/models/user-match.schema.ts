import { Schema } from "mongoose";

import { BlSchemaName } from "#services/storage/bl-schema-names";
import { BlSchema } from "#services/storage_service";
import { UserMatch } from "#shared/match/user-match";

const { ObjectId } = Schema.Types;

export const UserMatchSchema: BlSchema<UserMatch> = new Schema({
  customerA: {
    type: ObjectId,
    required: true,
    ref: BlSchemaName.UserDetails,
  },
  customerB: {
    type: ObjectId,
    required: true,
    ref: BlSchemaName.UserDetails,
  },
  expectedAToBItems: {
    type: [ObjectId],
    required: true,
    ref: BlSchemaName.Items,
  },
  expectedBToAItems: {
    type: [ObjectId],
    required: true,
    ref: BlSchemaName.Items,
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
