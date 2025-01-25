import { Company } from "@shared/company/company.js";
import { Schema } from "mongoose";

import { BlModel } from "#services/storage/bl-storage";

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
