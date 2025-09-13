import { ObjectId } from "mongodb";
import { Schema } from "mongoose";

import { BranchItemSchema } from "#models/branch-item.schema";
import { BranchSchema } from "#models/branch.schema";
import { CompanySchema } from "#models/company.schema";
import { CustomerItemSchema } from "#models/customer-item.schema";
import { DeliverySchema } from "#models/delivery.schema";
import { EditableTextSchema } from "#models/editable-text.schema";
import { EmailValidationSchema } from "#models/email-validation.schema";
import { InvoiceSchema } from "#models/invoice.schema";
import { ItemSchema } from "#models/item.schema";
import { MessageSchema } from "#models/message.schema";
import { OpeningHourSchema } from "#models/opening-hour.schema";
import { OrderSchema } from "#models/order.schema";
import { PaymentSchema } from "#models/payment.schema";
import { PendingPasswordResetSchema } from "#models/pending-password-reset.schema";
import { QuestionsAndAnswersSchema } from "#models/questions-and-answers.schema";
import { SignatureSchema } from "#models/signature.schema";
import { StandMatchSchema } from "#models/stand-match.schema";
import { BlSchemaName } from "#models/storage/bl-schema-names";
import { MongodbHandler } from "#models/storage/mongodb-handler";
import { UniqueItemSchema } from "#models/unique-item.schema";
import { UserDetailSchema } from "#models/user-detail.schema";
import { UserMatchSchema } from "#models/user-match.schema";
import { UserSchema } from "#models/user.schema";
import { WaitingListEntriesSchema } from "#models/waiting-list-entries.schema";

export type BlSchema<T> = Schema<ToSchema<T>>;

export const StorageService = {
  Branches: new MongodbHandler(BranchSchema, BlSchemaName.Branches),
  BranchItems: new MongodbHandler(BranchItemSchema, BlSchemaName.BranchItems),
  Companies: new MongodbHandler(CompanySchema, BlSchemaName.Companies),
  CustomerItems: new MongodbHandler(
    CustomerItemSchema,
    BlSchemaName.CustomerItems,
  ),
  Deliveries: new MongodbHandler(DeliverySchema, BlSchemaName.Deliveries),
  EditableTexts: new MongodbHandler(
    EditableTextSchema,
    BlSchemaName.EditableTexts,
  ),
  EmailValidations: new MongodbHandler(
    EmailValidationSchema,
    BlSchemaName.EmailValidations,
  ),
  Invoices: new MongodbHandler(InvoiceSchema, BlSchemaName.Invoices),
  Items: new MongodbHandler(ItemSchema, BlSchemaName.Items),
  Messages: new MongodbHandler(MessageSchema, BlSchemaName.Messages),
  OpeningHours: new MongodbHandler(
    OpeningHourSchema,
    BlSchemaName.OpeningHours,
  ),
  Orders: new MongodbHandler(OrderSchema, BlSchemaName.Orders),
  Payments: new MongodbHandler(PaymentSchema, BlSchemaName.Payments),
  PendingPasswordResets: new MongodbHandler(
    PendingPasswordResetSchema,
    BlSchemaName.PendingPasswordResets,
  ),
  QuestionsAndAnswers: new MongodbHandler(
    QuestionsAndAnswersSchema,
    BlSchemaName.QuestionsAndAnswers,
  ),
  Signatures: new MongodbHandler(SignatureSchema, BlSchemaName.Signatures),
  StandMatches: new MongodbHandler(StandMatchSchema, BlSchemaName.StandMatches),
  UniqueItems: new MongodbHandler(UniqueItemSchema, BlSchemaName.UniqueItems),
  Users: new MongodbHandler(UserSchema, BlSchemaName.Users),
  UserDetails: new MongodbHandler(UserDetailSchema, BlSchemaName.UserDetails),
  UserMatches: new MongodbHandler(UserMatchSchema, BlSchemaName.UserMatches),
  WaitingListEntries: new MongodbHandler(
    WaitingListEntriesSchema,
    BlSchemaName.WaitingListEntries,
  ),
} as const;

export type BlStorageHandler =
  (typeof StorageService)[keyof typeof StorageService];

type BlModelTypes = {
  [K in keyof typeof StorageService]: (typeof StorageService)[K] extends MongodbHandler<
    infer T
  >
    ? T
    : never;
}[keyof typeof StorageService];

export type BlStorageData =
  | {
      [K in keyof typeof StorageService]: (typeof StorageService)[K] extends MongodbHandler<
        infer T
      >
        ? T[]
        : never;
    }[keyof typeof StorageService]
  | BlModelTypes[];

// Re-format BlDocument type to one fitting for mongoose schemas
// Recursively union string-fields with ObjectId (e.g. {b: string} => {b: string | ObjectId}), except if the field is
// named "type" (because that's reserved and errors)
type ToSchema<T> = {
  [key in keyof T]: T[key] extends string
    ? key extends "type"
      ? T[key]
      : T[key] | ObjectId
    : T[key] extends "boolean" | "number"
      ? T[key]
      : ToSchema<T[key]>;
};
