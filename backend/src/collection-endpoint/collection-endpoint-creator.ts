import { CollectionEndpoint } from "@backend/collection-endpoint/collection-endpoint";
import { BranchCollection } from "@backend/collections/branch/branch.collection";
import { BranchItemCollection } from "@backend/collections/branch-item/branch-item.collection";
import { CompanyCollection } from "@backend/collections/company/company.collection";
import { CustomerItemCollection } from "@backend/collections/customer-item/customer-item.collection";
import { DeliveryCollection } from "@backend/collections/delivery/delivery.collection";
import { EditableTextCollection } from "@backend/collections/editable-text/editable-text.collection";
import { EmailValidationCollection } from "@backend/collections/email-validation/email-validation.collection";
import { InvoiceCollection } from "@backend/collections/invoice/invoice.collection";
import { ItemCollection } from "@backend/collections/item/item.collection";
import { MessageCollection } from "@backend/collections/message/message.collection";
import { OpeningHourCollection } from "@backend/collections/opening-hour/opening-hour.collection";
import { OrderCollection } from "@backend/collections/order/order.collection";
import { PaymentCollection } from "@backend/collections/payment/payment.collection";
import { PendingPasswordResetCollection } from "@backend/collections/pending-password-reset/pending-password-reset.collection";
import { SignatureCollection } from "@backend/collections/signature/signature.collection";
import { StandMatchCollection } from "@backend/collections/stand-match/stand-match.collection";
import { UniqueItemCollection } from "@backend/collections/unique-item/unique-item.collection";
import { UserDetailCollection } from "@backend/collections/user-detail/user-detail.collection";
import { UserMatchCollection } from "@backend/collections/user-match/user-match.collection";
import { Router } from "express";

export function createCollectionEndpoints(router: Router) {
  const collectionEndpoints = [
    new CollectionEndpoint(router, BranchCollection),
    new CollectionEndpoint(router, BranchItemCollection),
    new CollectionEndpoint(router, CustomerItemCollection),
    new CollectionEndpoint(router, DeliveryCollection),
    new CollectionEndpoint(router, ItemCollection),
    new CollectionEndpoint(router, OpeningHourCollection),
    new CollectionEndpoint(router, OrderCollection),
    new CollectionEndpoint(router, PaymentCollection),
    new CollectionEndpoint(router, UserDetailCollection),
    new CollectionEndpoint(router, PendingPasswordResetCollection),
    new CollectionEndpoint(router, EmailValidationCollection),
    new CollectionEndpoint(router, MessageCollection),
    new CollectionEndpoint(router, StandMatchCollection),
    new CollectionEndpoint(router, UserMatchCollection),
    new CollectionEndpoint(router, InvoiceCollection),
    new CollectionEndpoint(router, CompanyCollection),
    new CollectionEndpoint(router, UniqueItemCollection),
    new CollectionEndpoint(router, EditableTextCollection),
    new CollectionEndpoint(router, SignatureCollection),
  ];

  for (const collectionEndpoint of collectionEndpoints) {
    collectionEndpoint.create();
    collectionEndpoint.printEndpoints();
  }
}
