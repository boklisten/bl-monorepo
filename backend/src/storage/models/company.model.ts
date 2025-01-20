import { BlModel } from "@backend/storage/bl-storage.js";
import { Company } from "@shared/company/company.js";
import { Schema } from "mongoose";

export const CompanyModel: BlModel<Company> = {
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
