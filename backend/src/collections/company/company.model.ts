import { BlModelName, BlModel } from "@backend/collections/bl-collection";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { Company } from "@shared/company/company";
import { Schema } from "mongoose";

export const CompanyModel: BlModel<Company> = {
  name: BlModelName.Companies,
  schema: new Schema<ToSchema<Company>>({
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
