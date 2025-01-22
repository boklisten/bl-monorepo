import { ToSchema } from "@backend/express/helper/typescript-helpers.js";
import { BranchItemModel } from "@backend/express/storage/models/branch-item.model.js";
import { BranchModel } from "@backend/express/storage/models/branch.model.js";
import { CompanyModel } from "@backend/express/storage/models/company.model.js";
import { CustomerItemModel } from "@backend/express/storage/models/customer-item.model.js";
import { DeliveryModel } from "@backend/express/storage/models/delivery.model.js";
import { EditableTextModel } from "@backend/express/storage/models/editable-text.model.js";
import { EmailValidationModel } from "@backend/express/storage/models/email-validation.model.js";
import { InvoiceModel } from "@backend/express/storage/models/invoice.model.js";
import { ItemModel } from "@backend/express/storage/models/item.model.js";
import { LocalLoginModel } from "@backend/express/storage/models/local-login.model.js";
import { MessageModel } from "@backend/express/storage/models/message.model.js";
import { OpeningHourModel } from "@backend/express/storage/models/opening-hour.model.js";
import { OrderModel } from "@backend/express/storage/models/order.model.js";
import { PaymentModel } from "@backend/express/storage/models/payment.model.js";
import { PendingPasswordResetModel } from "@backend/express/storage/models/pending-password-reset.model.js";
import { SignatureModel } from "@backend/express/storage/models/signature.model.js";
import { StandMatchModel } from "@backend/express/storage/models/stand-match.model.js";
import { UniqueItemModel } from "@backend/express/storage/models/unique-item.model.js";
import { UserDetailModel } from "@backend/express/storage/models/user-detail.model.js";
import { UserMatchModel } from "@backend/express/storage/models/user-match.model.js";
import { UserModel } from "@backend/express/storage/models/user.model.js";
import { MongodbHandler } from "@backend/express/storage/mongodb-handler.js";
import { Schema } from "mongoose";

export interface BlModel<T> {
  name: string;
  schema: Schema<ToSchema<T>>;
}

export const BlStorage = {
  Branches: new MongodbHandler(BranchModel),
  BranchItems: new MongodbHandler(BranchItemModel),
  Companies: new MongodbHandler(CompanyModel),
  CustomerItems: new MongodbHandler(CustomerItemModel),
  Deliveries: new MongodbHandler(DeliveryModel),
  EditableTexts: new MongodbHandler(EditableTextModel),
  EmailValidations: new MongodbHandler(EmailValidationModel),
  Invoices: new MongodbHandler(InvoiceModel),
  Items: new MongodbHandler(ItemModel),
  LocalLogins: new MongodbHandler(LocalLoginModel),
  Messages: new MongodbHandler(MessageModel),
  OpeningHours: new MongodbHandler(OpeningHourModel),
  Orders: new MongodbHandler(OrderModel),
  Payments: new MongodbHandler(PaymentModel),
  PendingPasswordResets: new MongodbHandler(PendingPasswordResetModel),
  Signatures: new MongodbHandler(SignatureModel),
  StandMatches: new MongodbHandler(StandMatchModel),
  UniqueItems: new MongodbHandler(UniqueItemModel),
  Users: new MongodbHandler(UserModel),
  UserDetails: new MongodbHandler(UserDetailModel),
  UserMatches: new MongodbHandler(UserMatchModel),
};

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
