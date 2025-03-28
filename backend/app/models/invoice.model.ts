import { Schema } from "mongoose";

import { BlModel } from "#services/storage/bl-storage";
import { Invoice } from "#shared/invoice/invoice";

export const InvoiceModel: BlModel<Invoice> = {
  name: "invoices",
  schema: new Schema({
    duedate: {
      type: Date,
      required: true,
    },
    customerHavePayed: {
      type: Boolean,
      default: false,
    },
    branch: Schema.Types.ObjectId,
    toCreditNote: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
    },
    toDebtCollection: {
      type: Boolean,
      default: false,
    },
    toLossNote: {
      type: Boolean,
      default: false,
    },
    customerItemPayments: {
      type: [
        {
          customerItem: Schema.Types.ObjectId,
          title: String,
          item: Schema.Types.ObjectId,
          numberOfItems: String,
          customerNumber: String,
          cancel: Boolean,
          customerItemType: String,
          organizationNumber: String,
          productNumber: String,
          payment: {
            unit: Number,
            gross: Number,
            net: Number,
            vat: Number,
            discount: Number,
          },
        },
      ],
      default: [],
    },
    customerInfo: {
      type: {
        userDetail: String,
        companyDetail: String,
        customerNumber: String,
        name: String,
        email: String,
        branchName: String,
        organizationNumber: String,
        phone: String,
        dob: String,
        postal: {
          address: String,
          city: String,
          code: String,
          country: String,
        },
      },
    },
    payment: {
      type: {
        total: {
          gross: Number,
          net: Number,
          vat: Number,
          discount: Number,
        },
        fee: {
          unit: Number,
          gross: Number,
          net: Number,
          vat: Number,
          discount: Number,
        },
        totalIncludingFee: Number,
      },
      required: true,
    },
    ourReference: String,
    invoiceId: String,
    reference: String,
    comments: {
      type: [
        {
          id: String,
          msg: String,
          creationTime: {
            type: Date,
            default: Date.now(),
          },
          user: Schema.Types.ObjectId,
        },
      ],
    },
  }),
};
