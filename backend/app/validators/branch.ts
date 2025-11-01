import vine from "@vinejs/vine";

import { percentageField } from "#validators/common/fields";

export const branchValidator = vine.compile(
  vine.object({
    active: vine.boolean(),
    isBranchItemsLive: vine.object({
      online: vine.boolean(),
      atBranch: vine.boolean(),
    }),
    paymentInfo: vine.object({
      responsible: vine.boolean(),
      responsibleForDelivery: vine.boolean(),
      payLater: vine.boolean(),
      partlyPaymentPeriods: vine.array(
        vine.object({
          type: vine.enum(["semester", "year", "day", "month", "hour"]),
          date: vine.date(),
          percentageBuyout: percentageField,
          percentageBuyoutUsed: percentageField,
          percentageUpFront: percentageField,
          percentageUpFrontUsed: percentageField,
        }),
      ),
      rentPeriods: vine.array(
        vine.object({
          type: vine.enum(["semester", "year", "day", "month", "hour"]),
          date: vine.date(),
          maxNumberOfPeriods: vine.number().positive(),
          percentage: percentageField,
        }),
      ),
      extendPeriods: vine.array(
        vine.object({
          type: vine.enum(["semester", "year", "day", "month", "hour"]),
          date: vine.date(),
          maxNumberOfPeriods: vine.number().positive(),
          price: vine.number().positive(),
          percentage: percentageField.optional(),
        }),
      ),
      buyout: vine.object({
        percentage: percentageField,
      }),
      sell: vine.object({
        percentage: percentageField,
      }),
    }),
    deliveryMethods: vine.object({
      branch: vine.boolean(),
      byMail: vine.boolean(),
    }),
  }),
);

export const branchBaseValidator = vine.compile(
  vine.object({
    name: vine.string(),
    localName: vine.string(),
    parentBranch: vine.string().optional(),
    childBranches: vine.array(vine.string()).optional(),
    childLabel: vine.string().optional(),
    location: vine.object({
      region: vine.string(),
      address: vine.string().optional(),
    }),
    type: vine.string().nullable(),
  }),
);
