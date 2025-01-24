import { Schema } from "mongoose";
export const PaymentModel = {
    name: "payments",
    schema: new Schema({
        method: {
            type: String,
            required: true,
        },
        order: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            required: false,
        },
        branch: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        taxAmount: {
            type: Number,
            required: true,
        },
        info: {
            type: Schema.Types.Mixed,
            required: false,
        },
        confirmed: {
            type: Boolean,
            default: false,
        },
        discount: {
            type: {
                amount: {
                    type: Number,
                    required: true,
                },
                coupon: String,
            },
            required: false,
        },
    }),
};
