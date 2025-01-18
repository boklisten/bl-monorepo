import { BlModel } from "@backend/storage/bl-storage";
import { OpeningHour } from "@shared/opening-hour/opening-hour";
import { Schema } from "mongoose";

export const OpeningHourModel: BlModel<OpeningHour> = {
  name: "openinghours",
  schema: new Schema({
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
