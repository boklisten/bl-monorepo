import { BranchCollection } from "#services/collections/branch/branch.collection";
import { BranchItemCollection } from "#services/collections/branch-item/branch-item.collection";
import { CompanyCollection } from "#services/collections/company/company.collection";
import { CustomerItemCollection } from "#services/collections/customer-item/customer-item.collection";
import { DeliveryCollection } from "#services/collections/delivery/delivery.collection";
import { InvoiceCollection } from "#services/collections/invoice/invoice.collection";
import { ItemCollection } from "#services/collections/item/item.collection";
import { MessageCollection } from "#services/collections/message/message.collection";
import { OpeningHourCollection } from "#services/collections/opening-hour/opening-hour.collection";
import { OrderCollection } from "#services/collections/order/order.collection";
import { PaymentCollection } from "#services/collections/payment/payment.collection";
import { SignatureCollection } from "#services/collections/signature/signature.collection";
import { StandMatchCollection } from "#services/collections/stand-match/stand-match.collection";
import { UniqueItemCollection } from "#services/collections/unique-item/unique-item.collection";
import { UserDetailCollection } from "#services/collections/user-detail/user-detail.collection";
import { UserMatchCollection } from "#services/collections/user-match/user-match.collection";

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
  MessageCollection,
  StandMatchCollection,
  UserMatchCollection,
  InvoiceCollection,
  CompanyCollection,
  UniqueItemCollection,
  SignatureCollection,
];

export default BlCollections;
