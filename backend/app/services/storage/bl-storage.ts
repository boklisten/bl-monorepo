import { Schema } from "mongoose";

import { BranchItemModel } from "#models/branch-item.model";
import { BranchModel } from "#models/branch.model";
import { CompanyModel } from "#models/company.model";
import { CustomerItemModel } from "#models/customer-item.model";
import { DeliveryModel } from "#models/delivery.model";
import { EditableTextModel } from "#models/editable-text.model";
import { EmailValidationModel } from "#models/email-validation.model";
import { InvoiceModel } from "#models/invoice.model";
import { ItemModel } from "#models/item.model";
import { LocalLoginModel } from "#models/local-login.model";
import { MessageModel } from "#models/message.model";
import { OpeningHourModel } from "#models/opening-hour.model";
import { OrderModel } from "#models/order.model";
import { PaymentModel } from "#models/payment.model";
import { PendingPasswordResetModel } from "#models/pending-password-reset.model";
import { SignatureModel } from "#models/signature.model";
import { StandMatchModel } from "#models/stand-match.model";
import { UniqueItemModel } from "#models/unique-item.model";
import { UserDetailModel } from "#models/user-detail.model";
import { UserMatchModel } from "#models/user-match.model";
import { UserModel } from "#models/user.model";
import { WaitingListEntriesModel } from "#models/waiting-list-entries.model";
import { ToSchema } from "#services/helper/typescript-helpers";
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
  WaitingListEntries: new MongodbHandler(WaitingListEntriesModel),
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
