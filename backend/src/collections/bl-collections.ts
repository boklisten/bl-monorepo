import { BranchCollection } from "@backend/collections/branch/branch.collection.js";
import { BranchItemCollection } from "@backend/collections/branch-item/branch-item.collection.js";
import { CompanyCollection } from "@backend/collections/company/company.collection.js";
import { CustomerItemCollection } from "@backend/collections/customer-item/customer-item.collection.js";
import { DeliveryCollection } from "@backend/collections/delivery/delivery.collection.js";
import { EditableTextCollection } from "@backend/collections/editable-text/editable-text.collection.js";
import { EmailValidationCollection } from "@backend/collections/email-validation/email-validation.collection.js";
import { InvoiceCollection } from "@backend/collections/invoice/invoice.collection.js";
import { ItemCollection } from "@backend/collections/item/item.collection.js";
import { MessageCollection } from "@backend/collections/message/message.collection.js";
import { OpeningHourCollection } from "@backend/collections/opening-hour/opening-hour.collection.js";
import { OrderCollection } from "@backend/collections/order/order.collection.js";
import { PaymentCollection } from "@backend/collections/payment/payment.collection.js";
import { PendingPasswordResetCollection } from "@backend/collections/pending-password-reset/pending-password-reset.collection.js";
import { SignatureCollection } from "@backend/collections/signature/signature.collection.js";
import { StandMatchCollection } from "@backend/collections/stand-match/stand-match.collection.js";
import { UniqueItemCollection } from "@backend/collections/unique-item/unique-item.collection.js";
import { UserDetailCollection } from "@backend/collections/user-detail/user-detail.collection.js";
import { UserMatchCollection } from "@backend/collections/user-match/user-match.collection.js";

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
