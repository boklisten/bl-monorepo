import { Schema } from "mongoose";
export const UniqueItemModel = {
    name: "uniqueitems",
    schema: new Schema({
        blid: {
            type: String,
            required: true,
        },
        item: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
    }),
};
