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
import { LocalLoginSchema } from "#models/local-login.schema";
import { MessageSchema } from "#models/message.schema";
import { OpeningHourSchema } from "#models/opening-hour.schema";
import { OrderSchema } from "#models/order.schema";
import { PaymentSchema } from "#models/payment.schema";
import { PendingPasswordResetSchema } from "#models/pending-password-reset.schema";
import { QuestionsAndAnswersSchema } from "#models/questions-and-answers.schema";
import { SignatureSchema } from "#models/signature.schema";
import { StandMatchSchema } from "#models/stand-match.schema";
import { UniqueItemSchema } from "#models/unique-item.schema";
import { UserDetailSchema } from "#models/user-detail.schema";
import { UserMatchSchema } from "#models/user-match.schema";
import { UserSchema } from "#models/user.schema";
import { WaitingListEntriesSchema } from "#models/waiting-list-entries.schema";
import { ToSchema } from "#services/helper/typescript-helpers";
import { BlSchemaName } from "#services/storage/bl-schema-names";
import { MongodbHandler } from "#services/storage/mongodb-handler";

export type BlSchema<T> = Schema<ToSchema<T>>;

export const BlStorage = {
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
  LocalLogins: new MongodbHandler(LocalLoginSchema, BlSchemaName.LocalLogins),
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

export type BlStorageHandler = (typeof BlStorage)[keyof typeof BlStorage];

type BlModelTypes = {
  [K in keyof typeof BlStorage]: (typeof BlStorage)[K] extends MongodbHandler<
    infer T
  >
    ? T
    : never;
}[keyof typeof BlStorage];

export type BlStorageData =
  | {
      [K in keyof typeof BlStorage]: (typeof BlStorage)[K] extends MongodbHandler<
        infer T
      >
        ? T[]
        : never;
    }[keyof typeof BlStorage]
  | BlModelTypes[];
