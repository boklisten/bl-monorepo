import { Schema } from "mongoose";
export const EmailValidationModel = {
    name: "email_validations",
    schema: new Schema({
        email: {
            type: String,
            required: true,
        },
        userDetail: Schema.Types.ObjectId,
    }),
};
