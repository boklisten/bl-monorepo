import { Schema } from "mongoose";
export const CompanyModel = {
    name: "companies",
    schema: new Schema({
        name: {
            type: String,
            required: true,
        },
        contactInfo: {
            phone: {
                type: String,
            },
            email: {
                type: String,
            },
            address: {
                type: String,
            },
            postCode: {
                type: String,
            },
            postCity: {
                type: String,
            },
        },
        customerNumber: {
            type: String,
        },
        organizationNumber: {
            type: String,
        },
    }),
};
