import { UserDetailHelper } from "@backend/lib/collections/user-detail/helpers/user-detail.helper.js";
import { APP_CONFIG } from "@backend/lib/config/application-config.js";
import { BlEnv } from "@backend/lib/config/env.js";
import HttpHandler from "@backend/lib/http/http.handler.js";
import { DibsEasyOrder } from "@backend/lib/payment/dibs/dibs-easy-order.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class DibsPaymentService {
    userDetailHelper = new UserDetailHelper();
    getPaymentId(dibsEasyOrder) {
        return new Promise((resolve, reject) => {
            HttpHandler.post(BlEnv.DIBS_URI + APP_CONFIG.path.dibs.payment, dibsEasyOrder, BlEnv.DIBS_SECRET_KEY)
                .then((responseData) => {
                if (responseData &&
                    // @ts-expect-error fixme: auto ignored
                    responseData["paymentId"]) {
                    // @ts-expect-error fixme: auto ignored
                    return resolve(responseData["paymentId"]);
                }
                return reject(new BlError("did not get the paymentId back from dibs"));
            })
                .catch((blError) => {
                reject(new BlError("could not get paymentID from dibs").add(blError));
            });
        });
    }
    fetchDibsPaymentData(paymentId) {
        return HttpHandler.get(BlEnv.DIBS_URI + APP_CONFIG.path.dibs.payment + "/" + paymentId, BlEnv.DIBS_SECRET_KEY)
            .then((response) => {
            // @ts-expect-error fixme: auto ignored
            if (!response["payment"]) {
                throw new BlError("dibs response did not include payment information").store("paymentId", paymentId);
            }
            // @ts-expect-error fixme: auto ignored
            return response["payment"];
        })
            .catch((getDibsPaymentDetailError) => {
            throw new BlError(`could not get payment details for paymentId "${paymentId}"`).add(getDibsPaymentDetailError);
        });
    }
    orderToDibsEasyOrder(userDetail, order, delivery) {
        this.validateOrder(order);
        const items = order.orderItems.map((orderItem) => this.orderItemToEasyItem(orderItem));
        if (order.delivery && delivery && delivery.amount > 0) {
            items.push(this.deliveryToDibsEasyItem(delivery));
        }
        const dibsEasyOrder = new DibsEasyOrder();
        dibsEasyOrder.order.reference = order.id;
        dibsEasyOrder.order.items = items;
        dibsEasyOrder.order.amount = this.getTotalGrossAmount(items);
        dibsEasyOrder.order.currency = "NOK";
        const userDetailValid = this.userDetailHelper.isValid(userDetail);
        const clientUri = BlEnv.CLIENT_URI;
        dibsEasyOrder.checkout = {
            url: clientUri + APP_CONFIG.path.client.checkout,
            termsUrl: clientUri + APP_CONFIG.path.client.agreement.rent,
            ShippingCountries: [{ countryCode: "NOR" }],
            merchantHandlesConsumerData: userDetailValid, // if userDetail is not valid, the customer must reenter data
            consumer: userDetailValid
                ? this.userDetailToDibsEasyConsumer(userDetail)
                : null,
        };
        return dibsEasyOrder;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userDetailToDibsEasyConsumer(userDetail) {
        return {
            email: userDetail.email,
            shippingAddress: {
                addressLine1: userDetail.address,
                addressLine2: "",
                postalCode: userDetail.postCode,
                city: userDetail.postCity,
                country: "NOR",
            },
            phoneNumber: {
                prefix: "+47",
                number: userDetail.phone,
            },
            privatePerson: {
                firstName: this.userDetailHelper.getFirstName(userDetail.name),
                lastName: this.userDetailHelper.getLastName(userDetail.name),
            },
        };
    }
    deliveryToDibsEasyItem(delivery) {
        return {
            reference: delivery.id,
            name: "delivery",
            quantity: 1,
            unit: "delivery",
            unitPrice: this.toEars(delivery.amount),
            taxRate: 0,
            taxAmount: delivery.taxAmount ? this.toEars(delivery.taxAmount) : 0,
            grossTotalAmount: this.toEars(delivery.amount),
            netTotalAmount: this.toEars(delivery.amount),
        };
    }
    validateOrder(order) {
        if (!order.id || order.id.length <= 0)
            throw new BlError("order.id is not defined");
        if (!order.byCustomer)
            throw new BlError("order.byCustomer is false, no need to make dibs easy order");
        if (order.amount == 0)
            throw new BlError("order.amount is zero");
    }
    getTotalGrossAmount(dibsEasyItems) {
        return dibsEasyItems.reduce((subTotal, dbi) => subTotal + dbi.grossTotalAmount, 0);
    }
    orderItemToEasyItem(orderItem) {
        return {
            reference: orderItem.item,
            name: orderItem.title,
            quantity: 1,
            unit: "book",
            unitPrice: this.toEars(orderItem.unitPrice),
            taxRate: this.toEars(orderItem.taxRate * 100),
            taxAmount: this.toEars(orderItem.taxAmount),
            netTotalAmount: this.toEars(orderItem.unitPrice),
            grossTotalAmount: this.toEars(orderItem.amount),
        };
    }
    toEars(price) {
        return price * 100;
    }
}
