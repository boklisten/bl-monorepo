import { BlModel } from "@backend/express/storage/bl-storage.js";
import { OpeningHour } from "@shared/opening-hour/opening-hour.js";
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
