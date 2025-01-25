import { Schema } from "mongoose";

import { ToSchema } from "#services/helper/typescript-helpers";
import { BranchItemModel } from "#services/storage/models/branch-item.model";
import { BranchModel } from "#services/storage/models/branch.model";
import { CompanyModel } from "#services/storage/models/company.model";
import { CustomerItemModel } from "#services/storage/models/customer-item.model";
import { DeliveryModel } from "#services/storage/models/delivery.model";
import { EditableTextModel } from "#services/storage/models/editable-text.model";
import { EmailValidationModel } from "#services/storage/models/email-validation.model";
import { InvoiceModel } from "#services/storage/models/invoice.model";
import { ItemModel } from "#services/storage/models/item.model";
import { LocalLoginModel } from "#services/storage/models/local-login.model";
import { MessageModel } from "#services/storage/models/message.model";
import { OpeningHourModel } from "#services/storage/models/opening-hour.model";
import { OrderModel } from "#services/storage/models/order.model";
import { PaymentModel } from "#services/storage/models/payment.model";
import { PendingPasswordResetModel } from "#services/storage/models/pending-password-reset.model";
import { SignatureModel } from "#services/storage/models/signature.model";
import { StandMatchModel } from "#services/storage/models/stand-match.model";
import { UniqueItemModel } from "#services/storage/models/unique-item.model";
import { UserDetailModel } from "#services/storage/models/user-detail.model";
import { UserMatchModel } from "#services/storage/models/user-match.model";
import { UserModel } from "#services/storage/models/user.model";
import { MongodbHandler } from "#services/storage/mongodb-handler";

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
