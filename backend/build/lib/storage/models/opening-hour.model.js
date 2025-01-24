import { Schema } from "mongoose";
export const OpeningHourModel = {
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
