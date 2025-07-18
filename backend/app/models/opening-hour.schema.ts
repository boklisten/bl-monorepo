import { Schema } from "mongoose";

import { BlSchemaName } from "#services/storage/bl-schema-names";
import { BlSchema } from "#services/storage/bl-storage";
import { OpeningHour } from "#shared/opening-hour/opening-hour";

export const OpeningHourSchema: BlSchema<OpeningHour> = new Schema({
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
  branch: {
    type: Schema.Types.ObjectId,
    ref: BlSchemaName.Branches,
    required: true,
  },
  creationTime: {
    type: Date,
    index: {
      name: "expire_after",
      expires: 60 * 60 * 24 * 365 * 2,
    },
  },
});
