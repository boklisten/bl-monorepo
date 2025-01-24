import { Schema } from "mongoose";
export const EditableTextModel = {
    name: "editabletexts",
    schema: new Schema({
        text: {
            type: String,
            required: true,
        },
    }),
};
