import { ToSchema } from "@backend/helper/typescript-helpers";
import { OpeningHour } from "@shared/opening-hour/opening-hour";
import { Schema } from "mongoose";

export const openingHourSchema = new Schema<ToSchema<OpeningHour>>({
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
    required: true,
  },
});
