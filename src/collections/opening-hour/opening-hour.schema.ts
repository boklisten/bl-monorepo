import { OpeningHour } from "@boklisten/bl-model";
import { Schema } from "mongoose";

import { ToSchema } from "@/helper/typescript-helpers";

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
