import { Schema } from "mongoose";
export const SignatureModel = {
    name: "signatures",
    schema: new Schema({
        image: {
            type: Buffer,
            required: true,
        },
        signingName: {
            type: String,
            required: true,
        },
        signedByGuardian: {
            type: Boolean,
            required: true,
        },
    }),
};
