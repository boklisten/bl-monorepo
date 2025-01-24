import { BranchCollection } from "@backend/lib/collections/branch/branch.collection.js";
import { BranchItemCollection } from "@backend/lib/collections/branch-item/branch-item.collection.js";
import { CompanyCollection } from "@backend/lib/collections/company/company.collection.js";
import { CustomerItemCollection } from "@backend/lib/collections/customer-item/customer-item.collection.js";
import { DeliveryCollection } from "@backend/lib/collections/delivery/delivery.collection.js";
import { EditableTextCollection } from "@backend/lib/collections/editable-text/editable-text.collection.js";
import { EmailValidationCollection } from "@backend/lib/collections/email-validation/email-validation.collection.js";
import { InvoiceCollection } from "@backend/lib/collections/invoice/invoice.collection.js";
import { ItemCollection } from "@backend/lib/collections/item/item.collection.js";
import { MessageCollection } from "@backend/lib/collections/message/message.collection.js";
import { OpeningHourCollection } from "@backend/lib/collections/opening-hour/opening-hour.collection.js";
import { OrderCollection } from "@backend/lib/collections/order/order.collection.js";
import { PaymentCollection } from "@backend/lib/collections/payment/payment.collection.js";
import { PendingPasswordResetCollection } from "@backend/lib/collections/pending-password-reset/pending-password-reset.collection.js";
import { SignatureCollection } from "@backend/lib/collections/signature/signature.collection.js";
import { StandMatchCollection } from "@backend/lib/collections/stand-match/stand-match.collection.js";
import { UniqueItemCollection } from "@backend/lib/collections/unique-item/unique-item.collection.js";
import { UserDetailCollection } from "@backend/lib/collections/user-detail/user-detail.collection.js";
import { UserMatchCollection } from "@backend/lib/collections/user-match/user-match.collection.js";
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
