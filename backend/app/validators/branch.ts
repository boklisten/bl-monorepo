import vine from "@vinejs/vine";

import { percentageField } from "#validators/common/fields";

export const branchCreateValidator = vine.compile(
  vine.object({
    name: vine.string(),
    location: vine.object({
      region: vine.string(),
      address: vine.string().optional(),
    }),
    type: vine.string().nullable(),
  }),
);

export const branchValidator = vine.compile(
  vine.object({
    id: vine.string().optional(),
    name: vine.string().optional(),
    location: vine
      .object({
        region: vine.string().optional(),
        address: vine.string().optional(),
      })
      .optional(),
    type: vine.string().nullable(),
    active: vine.boolean().optional(),
    isBranchItemsLive: vine
      .object({
        online: vine.boolean(),
        atBranch: vine.boolean(),
      })
      .optional(),
    paymentInfo: vine
      .object({
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
      })
      .optional(),
    deliveryMethods: vine
      .object({
        branch: vine.boolean(),
        byMail: vine.boolean(),
      })
      .optional(),
  }),
);

export const branchRelationshipValidator = vine.compile(
  vine.object({
    id: vine.string(),
    localName: vine.string().optional(),
    parentBranch: vine.string().optional(),
    childBranches: vine.array(vine.string()).optional(),
    childLabel: vine.string().optional(),
  }),
);
