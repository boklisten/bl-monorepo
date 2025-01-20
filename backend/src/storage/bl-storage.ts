import { ToSchema } from "@backend/helper/typescript-helpers.js";
import { BranchItemModel } from "@backend/storage/models/branch-item.model.js";
import { BranchModel } from "@backend/storage/models/branch.model.js";
import { CompanyModel } from "@backend/storage/models/company.model.js";
import { CustomerItemModel } from "@backend/storage/models/customer-item.model.js";
import { DeliveryModel } from "@backend/storage/models/delivery.model.js";
import { EditableTextModel } from "@backend/storage/models/editable-text.model.js";
import { EmailValidationModel } from "@backend/storage/models/email-validation.model.js";
import { InvoiceModel } from "@backend/storage/models/invoice.model.js";
import { ItemModel } from "@backend/storage/models/item.model.js";
import { LocalLoginModel } from "@backend/storage/models/local-login.model.js";
import { MessageModel } from "@backend/storage/models/message.model.js";
import { OpeningHourModel } from "@backend/storage/models/opening-hour.model.js";
import { OrderModel } from "@backend/storage/models/order.model.js";
import { PaymentModel } from "@backend/storage/models/payment.model.js";
import { PendingPasswordResetModel } from "@backend/storage/models/pending-password-reset.model.js";
import { SignatureModel } from "@backend/storage/models/signature.model.js";
import { StandMatchModel } from "@backend/storage/models/stand-match.model.js";
import { UniqueItemModel } from "@backend/storage/models/unique-item.model.js";
import { UserDetailModel } from "@backend/storage/models/user-detail.model.js";
import { UserMatchModel } from "@backend/storage/models/user-match.model.js";
import { UserModel } from "@backend/storage/models/user.model.js";
import { MongoDbBlStorageHandler } from "@backend/storage/mongoDb/mongoDb.blStorageHandler.js";
import { Schema } from "mongoose";

export interface BlModel<T> {
  name: string;
  schema: Schema<ToSchema<T>>;
}

export const BlStorage = {
  Branches: new MongoDbBlStorageHandler(BranchModel),
  BranchItems: new MongoDbBlStorageHandler(BranchItemModel),
  Companies: new MongoDbBlStorageHandler(CompanyModel),
  CustomerItems: new MongoDbBlStorageHandler(CustomerItemModel),
  Deliveries: new MongoDbBlStorageHandler(DeliveryModel),
  EditableTexts: new MongoDbBlStorageHandler(EditableTextModel),
  EmailValidations: new MongoDbBlStorageHandler(EmailValidationModel),
  Invoices: new MongoDbBlStorageHandler(InvoiceModel),
  Items: new MongoDbBlStorageHandler(ItemModel),
  LocalLogins: new MongoDbBlStorageHandler(LocalLoginModel),
  Messages: new MongoDbBlStorageHandler(MessageModel),
  OpeningHours: new MongoDbBlStorageHandler(OpeningHourModel),
  Orders: new MongoDbBlStorageHandler(OrderModel),
  Payments: new MongoDbBlStorageHandler(PaymentModel),
  PendingPasswordResets: new MongoDbBlStorageHandler(PendingPasswordResetModel),
  Signatures: new MongoDbBlStorageHandler(SignatureModel),
  StandMatches: new MongoDbBlStorageHandler(StandMatchModel),
  UniqueItems: new MongoDbBlStorageHandler(UniqueItemModel),
  Users: new MongoDbBlStorageHandler(UserModel),
  UserDetails: new MongoDbBlStorageHandler(UserDetailModel),
  UserMatches: new MongoDbBlStorageHandler(UserMatchModel),
};

export type BlStorageHandler = (typeof BlStorage)[keyof typeof BlStorage];

type BlModelTypes = {
  [K in keyof typeof BlStorage]: (typeof BlStorage)[K] extends MongoDbBlStorageHandler<
    infer T
  >
    ? T
    : never;
}[keyof typeof BlStorage];

export type BlStorageData =
  | {
      [K in keyof typeof BlStorage]: (typeof BlStorage)[K] extends MongoDbBlStorageHandler<
        infer T
      >
        ? T[]
        : never;
    }[keyof typeof BlStorage]
  | BlModelTypes[];
