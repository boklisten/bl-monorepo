import { BlModelName, BlModel } from "@backend/collections/bl-collection";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { OpeningHour } from "@shared/opening-hour/opening-hour";
import { Schema } from "mongoose";

export const OpeningHourModel: BlModel<OpeningHour> = {
  name: BlModelName.OpeningHours,
  schema: new Schema<ToSchema<OpeningHour>>({
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
  }),
};
