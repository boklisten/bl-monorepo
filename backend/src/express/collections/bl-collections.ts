import { BranchCollection } from "@backend/express/collections/branch/branch.collection.js";
import { BranchItemCollection } from "@backend/express/collections/branch-item/branch-item.collection.js";
import { CompanyCollection } from "@backend/express/collections/company/company.collection.js";
import { CustomerItemCollection } from "@backend/express/collections/customer-item/customer-item.collection.js";
import { DeliveryCollection } from "@backend/express/collections/delivery/delivery.collection.js";
import { EditableTextCollection } from "@backend/express/collections/editable-text/editable-text.collection.js";
import { EmailValidationCollection } from "@backend/express/collections/email-validation/email-validation.collection.js";
import { InvoiceCollection } from "@backend/express/collections/invoice/invoice.collection.js";
import { ItemCollection } from "@backend/express/collections/item/item.collection.js";
import { MessageCollection } from "@backend/express/collections/message/message.collection.js";
import { OpeningHourCollection } from "@backend/express/collections/opening-hour/opening-hour.collection.js";
import { OrderCollection } from "@backend/express/collections/order/order.collection.js";
import { PaymentCollection } from "@backend/express/collections/payment/payment.collection.js";
import { PendingPasswordResetCollection } from "@backend/express/collections/pending-password-reset/pending-password-reset.collection.js";
import { SignatureCollection } from "@backend/express/collections/signature/signature.collection.js";
import { StandMatchCollection } from "@backend/express/collections/stand-match/stand-match.collection.js";
import { UniqueItemCollection } from "@backend/express/collections/unique-item/unique-item.collection.js";
import { UserDetailCollection } from "@backend/express/collections/user-detail/user-detail.collection.js";
import { UserMatchCollection } from "@backend/express/collections/user-match/user-match.collection.js";

const BlCollections = [
  BranchCollection,
  BranchItemCollection,
  CustomerItemCollection,
  DeliveryCollection,
  ItemCollection,
  OpeningHourCollection,
  OrderCollection,
  PaymentCollection,
  UserDetailCollection,
  PendingPasswordResetCollection,
  EmailValidationCollection,
  MessageCollection,
  StandMatchCollection,
  UserMatchCollection,
  InvoiceCollection,
  CompanyCollection,
  UniqueItemCollection,
  EditableTextCollection,
  SignatureCollection,
];

export default BlCollections;
