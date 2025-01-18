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
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { Router } from "express";

export class CollectionEndpointCreator {
  constructor(private router: Router) {
    new SEResponseHandler();
  }

  create() {
    const collectionEndpoints = [
      new CollectionEndpoint(this.router, BranchCollection),
      new CollectionEndpoint(this.router, BranchItemCollection),
      new CollectionEndpoint(this.router, CustomerItemCollection),
      new CollectionEndpoint(this.router, DeliveryCollection),
      new CollectionEndpoint(this.router, ItemCollection),
      new CollectionEndpoint(this.router, OpeningHourCollection),
      new CollectionEndpoint(this.router, OrderCollection),
      new CollectionEndpoint(this.router, PaymentCollection),
      new CollectionEndpoint(this.router, UserDetailCollection),
      new CollectionEndpoint(this.router, PendingPasswordResetCollection),
      new CollectionEndpoint(this.router, EmailValidationCollection),
      new CollectionEndpoint(this.router, MessageCollection),
      new CollectionEndpoint(this.router, StandMatchCollection),
      new CollectionEndpoint(this.router, UserMatchCollection),
      new CollectionEndpoint(this.router, InvoiceCollection),
      new CollectionEndpoint(this.router, CompanyCollection),
      new CollectionEndpoint(this.router, UniqueItemCollection),
      new CollectionEndpoint(this.router, EditableTextCollection),
      new CollectionEndpoint(this.router, SignatureCollection),
    ];

    for (const collectionEndpoint of collectionEndpoints) {
      collectionEndpoint.create();
      collectionEndpoint.printEndpoints();
    }
  }
}
