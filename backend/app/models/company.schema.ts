import { Schema } from "mongoose";

import { BlSchema } from "#services/storage/bl-storage";
import { Company } from "#shared/company/company";

export const CompanySchema: BlSchema<Company> = new Schema({
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
});
