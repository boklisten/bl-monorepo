import { CollectionEndpoint } from "@backend/collection-endpoint/collection-endpoint";
import { BranchCollection } from "@backend/collections/branch/branch.collection";
import { BranchItemCollection } from "@backend/collections/branch-item/branch-item.collection";
import { CompanyCollection } from "@backend/collections/company/company.collection";
import { CustomerItemCollection } from "@backend/collections/customer-item/customer-item.collection";
import { DeliveryCollection } from "@backend/collections/delivery/delivery.collection";
import { EditableTextCollection } from "@backend/collections/editable-text/editable-text.collection";
import { EmailValidation } from "@backend/collections/email-validation/email-validation";
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
import { Branch } from "@shared/branch/branch";
import { BranchItem } from "@shared/branch-item/branch-item";
import { Company } from "@shared/company/company";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Delivery } from "@shared/delivery/delivery";
import { EditableText } from "@shared/editable-text/editable-text";
import { Invoice } from "@shared/invoice/invoice";
import { Item } from "@shared/item/item";
import { StandMatch } from "@shared/match/stand-match";
import { UserMatch } from "@shared/match/user-match";
import { Message } from "@shared/message/message";
import { OpeningHour } from "@shared/opening-hour/opening-hour";
import { Order } from "@shared/order/order";
import { PendingPasswordReset } from "@shared/password-reset/pending-password-reset";
import { Payment } from "@shared/payment/payment";
import { SerializedSignature } from "@shared/signature/serialized-signature";
import { UniqueItem } from "@shared/unique-item/unique-item";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { Router } from "express";

export class CollectionEndpointCreator {
  constructor(private _router: Router) {
    new SEResponseHandler();
  }

  create() {
    const collectionEndpoints = [
      new CollectionEndpoint<Branch>(this._router, BranchCollection),
      new CollectionEndpoint<BranchItem>(this._router, BranchItemCollection),
      new CollectionEndpoint<CustomerItem>(
        this._router,
        CustomerItemCollection,
      ),
      new CollectionEndpoint<Delivery>(this._router, DeliveryCollection),
      new CollectionEndpoint<Item>(this._router, ItemCollection),
      new CollectionEndpoint<OpeningHour>(this._router, OpeningHourCollection),
      new CollectionEndpoint<Order>(this._router, OrderCollection),
      new CollectionEndpoint<Payment>(this._router, PaymentCollection),
      new CollectionEndpoint<UserDetail>(this._router, UserDetailCollection),
      new CollectionEndpoint<PendingPasswordReset>(
        this._router,
        PendingPasswordResetCollection,
      ),
      new CollectionEndpoint<EmailValidation>(
        this._router,
        EmailValidationCollection,
      ),
      new CollectionEndpoint<Message>(this._router, MessageCollection),
      new CollectionEndpoint<StandMatch>(this._router, StandMatchCollection),
      new CollectionEndpoint<UserMatch>(this._router, UserMatchCollection),
      new CollectionEndpoint<Invoice>(this._router, InvoiceCollection),
      new CollectionEndpoint<Company>(this._router, CompanyCollection),
      new CollectionEndpoint<UniqueItem>(this._router, UniqueItemCollection),
      new CollectionEndpoint<EditableText>(
        this._router,
        EditableTextCollection,
      ),
      new CollectionEndpoint<SerializedSignature>(
        this._router,
        SignatureCollection,
      ),
    ];

    for (const collectionEndpoint of collectionEndpoints) {
      collectionEndpoint.create();
      collectionEndpoint.printEndpoints();
    }
  }
}
