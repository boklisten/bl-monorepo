import { DateService } from "@backend/lib/blc/date.service.js";
import { userHasValidSignature } from "@backend/lib/collections/signature/helpers/signature.helper.js";
import { BlEnv } from "@backend/lib/config/env.js";
import { sendMail } from "@backend/lib/messenger/email/email-service.js";
import { EMAIL_SETTINGS } from "@backend/lib/messenger/email/email-settings.js";
import { sendSMS } from "@backend/lib/messenger/sms/sms-service.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import moment from "moment-timezone";
export class OrderEmailHandler {
    emailHandler;
    defaultCurrency = "NOK";
    standardTimeFormat = "DD.MM.YYYY HH.mm.ss";
    localeSetting = "nb";
    noPaymentNoticeText = "Dette er kun en reservasjon, du har ikke betalt enda. Du betaler først når du kommer til oss på stand.";
    constructor(emailHandler) {
        this.emailHandler = emailHandler;
    }
    async sendOrderReceipt(customerDetail, order) {
        const emailSetting = {
            toEmail: customerDetail.email,
            fromEmail: EMAIL_SETTINGS.types.receipt.fromEmail,
            subject: EMAIL_SETTINGS.types.receipt.subject + ` #${order.id}`,
            userId: customerDetail.id,
        };
        const branchId = order.branch;
        const withAgreement = await this.shouldSendAgreement(order, customerDetail, branchId);
        const emailOrder = await this.orderToEmailOrder(order);
        emailOrder.loan = withAgreement;
        const emailUser = {
            id: customerDetail.id,
            dob: customerDetail.dob
                ? DateService.toPrintFormat(customerDetail.dob, "Europe/Oslo")
                : "",
            name: customerDetail.name,
            email: customerDetail.email,
            address: customerDetail.address,
        };
        if (withAgreement) {
            const branch = await BlStorage.Branches.get(branchId);
            this.requestGuardianSignature(customerDetail, branch?.name ?? "", emailOrder, emailUser);
        }
        if (this.paymentNeeded(order)) {
            this.addNoPaymentProvidedNotice(emailSetting);
        }
        return await this.emailHandler
            .sendOrderReceipt(emailSetting, emailOrder, emailUser, withAgreement)
            .catch((error) => {
            throw new BlError("Unable to send order receipt email")
                .code(200)
                .add(error);
        });
    }
    paymentNeeded(order) {
        return (order.amount > 0 &&
            (!Array.isArray(order.payments) || order.payments.length === 0));
    }
    addNoPaymentProvidedNotice(emailSetting) {
        emailSetting.textBlocks ??= [];
        emailSetting.textBlocks.push({
            text: this.noPaymentNoticeText,
            warning: true,
        });
    }
    /**
     * sends out SMS and email to the guardian of a customer with a signature link if they are under 18
     */
    async requestGuardianSignature(customerDetail, branchName, emailOrder, emailUser) {
        if (moment(customerDetail.dob).isValid() &&
            moment(customerDetail.dob).isAfter(moment(new Date()).subtract(18, "years")) &&
            customerDetail?.guardian?.email) {
            const emailSetting = {
                toEmail: customerDetail.guardian.email,
                fromEmail: EMAIL_SETTINGS.types.guardianSignature.fromEmail,
                subject: EMAIL_SETTINGS.types.guardianSignature.subject,
                userId: customerDetail.id,
                userFullName: customerDetail.name,
            };
            /** fixme: delete after 1. oktober 2024 */
            const receiptEmailSetting = {
                toEmail: customerDetail.guardian.email,
                fromEmail: EMAIL_SETTINGS.types.receipt.fromEmail,
                subject: EMAIL_SETTINGS.types.receipt.subject + ` #${emailOrder.id}`,
                userId: customerDetail.id,
                userFullName: customerDetail.guardian.name,
            };
            this.emailHandler.sendOrderReceipt(receiptEmailSetting, emailOrder, emailUser, true);
            /** --- */
            if (await userHasValidSignature(customerDetail)) {
                return;
            }
            sendMail(emailSetting, EMAIL_SETTINGS.types.guardianSignature.templateId, {
                guardianSignatureUri: `${BlEnv.CLIENT_URI}${EMAIL_SETTINGS.types.guardianSignature.path}${customerDetail.id}`,
                customerName: customerDetail.name,
                guardianName: customerDetail.guardian.name,
                branchName: branchName,
            });
            sendSMS(customerDetail.guardian.phone, `Hei. ${customerDetail.name} har nylig bestilt bøker fra ${branchName} gjennom Boklisten.no. Siden ${customerDetail.name} er under 18 år, krever vi at du som foresatt signerer låneavtalen. Vi har derfor sendt en epost til ${customerDetail.guardian.email} med lenke til signering. Ta kontakt på info@boklisten.no om du har spørsmål. Mvh. Boklisten`);
        }
    }
    async orderToEmailOrder(order) {
        const emailOrder = {
            id: order.id,
            showDeadline: this.shouldShowDeadline(order),
            showPrice: order.amount !== 0,
            showStatus: true,
            currency: this.defaultCurrency,
            itemAmount: order.amount.toString(),
            totalAmount: order.amount.toString(), // should include the totalAmount including the delivery amount
            items: this.orderItemsToEmailItems(order.orderItems),
            showDelivery: false,
            // @ts-expect-error fixme: auto ignored
            delivery: null,
            showPayment: false,
            // @ts-expect-error fixme: auto ignored
            payment: null,
        };
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        let emailOrderDelivery;
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        let emailOrderPayment;
        try {
            emailOrderDelivery = await this.extractEmailOrderDeliveryFromOrder(order);
            emailOrderPayment = await this.extractEmailOrderPaymentFromOrder(order);
        }
        catch (error) {
            throw new BlError("could not create email based on order" + error);
        }
        emailOrder.showDelivery = emailOrderDelivery.showDelivery;
        emailOrder.delivery = emailOrderDelivery.delivery;
        if (emailOrder.delivery) {
            emailOrder.totalAmount =
                order.amount + emailOrderDelivery.delivery["amount"];
        }
        emailOrder.showPayment = emailOrderPayment.showPayment;
        emailOrder.payment = emailOrderPayment.payment;
        return emailOrder;
    }
    shouldShowDeadline(order) {
        return order.orderItems.some((orderItem) => orderItem.type === "rent" || orderItem.type === "extend");
    }
    extractEmailOrderPaymentFromOrder(order) {
        if (!Array.isArray(order.payments) || order.payments.length === 0) {
            return Promise.resolve({ payment: null, showPayment: false });
        }
        const paymentPromises = order.payments.map((payment) => BlStorage.Payments.get(payment));
        return Promise.all(paymentPromises)
            .then((payments) => {
            const emailPayment = {
                total: payments.reduce((subTotal, payment) => subTotal + payment.amount, 0),
                currency: this.defaultCurrency,
                taxAmount: 0,
                payments: payments.map((payment) => this.paymentToEmailPayment(payment)),
            };
            if (emailPayment.payments[0] &&
                // @ts-expect-error fixme: auto ignored
                emailPayment.payments[0]["info"] &&
                // @ts-expect-error fixme: auto ignored
                emailPayment.payments[0]["info"]["orderDetails"]) {
                emailPayment.currency =
                    // @ts-expect-error fixme: auto ignored
                    emailPayment.payments[0]["info"]["orderDetails"].currency;
            }
            return { payment: emailPayment, showPayment: true };
        })
            .catch((getPaymentsError) => {
            throw getPaymentsError;
        });
    }
    extractEmailOrderDeliveryFromOrder(order) {
        const deliveryId = order.delivery;
        if (!deliveryId?.length) {
            return Promise.resolve({ delivery: null, showDelivery: false });
        }
        return BlStorage.Deliveries.get(deliveryId)
            .then((delivery) => {
            return delivery.method === "bring"
                ? {
                    delivery: this.deliveryToEmailDelivery(delivery),
                    showDelivery: true,
                }
                : { delivery: null, showDelivery: false };
        })
            .catch((getDeliveryError) => {
            throw getDeliveryError;
        });
    }
    paymentToEmailPayment(payment) {
        if (!payment) {
            return null;
        }
        const paymentObject = {
            method: "",
            amount: "",
            cardInfo: null,
            // @ts-expect-error fixme: auto ignored
            taxAmount: isNaN(payment.taxAmount)
                ? null
                : payment.taxAmount?.toString(),
            paymentId: "",
            status: this.translatePaymentConfirmed(),
            creationTime: payment.creationTime
                ? DateService.format(payment.creationTime, "Europe/Oslo", this.standardTimeFormat)
                : null,
        };
        if (payment.method === "dibs") {
            if (payment.info) {
                // fixme baaaad type conversion
                const paymentInfo = payment.info;
                if (paymentInfo.paymentDetails) {
                    if (paymentInfo.paymentDetails.paymentMethod) {
                        paymentObject.method = paymentInfo.paymentDetails.paymentMethod;
                    }
                    if (paymentInfo.paymentDetails.cardDetails?.maskedPan) {
                        // @ts-expect-error fixme: auto ignored
                        paymentObject.cardInfo = `***${this.stripTo4LastDigits(paymentInfo.paymentDetails.cardDetails.maskedPan)}`;
                    }
                }
                if (paymentInfo.orderDetails?.amount) {
                    paymentObject.amount = (Number.parseInt(paymentInfo.orderDetails.amount.toString()) / 100).toString();
                }
                if (paymentInfo.paymentId) {
                    paymentObject.paymentId = paymentInfo.paymentId;
                }
            }
        }
        else {
            if (payment.method) {
                paymentObject.method = payment.method;
            }
            if (payment.amount) {
                paymentObject.amount = payment.amount.toString();
            }
            if (payment.id) {
                paymentObject.paymentId = payment.id;
            }
        }
        return paymentObject;
    }
    deliveryToEmailDelivery(delivery) {
        return {
            method: delivery.method,
            currency: this.defaultCurrency,
            amount: delivery.amount,
            // @ts-expect-error fixme: auto ignored
            address: delivery.info["shipmentAddress"]
                ? // @ts-expect-error fixme: auto ignored
                    `${delivery.info["shipmentAddress"].name}, ${delivery.info["shipmentAddress"].address}, ${delivery.info["shipmentAddress"].postalCode} ${delivery.info["shipmentAddress"].postalCity}`
                : null,
            // @ts-expect-error fixme: auto ignored
            trackingNumber: delivery.info["trackingNumber"],
            // @ts-expect-error fixme: auto ignored
            estimatedDeliveryDate: delivery.info["estimatedDelivery"]
                ? DateService.toPrintFormat(
                // @ts-expect-error fixme: auto ignored
                delivery.info["estimatedDelivery"], "Europe/Oslo")
                : "",
        };
    }
    orderItemsToEmailItems(orderItems) {
        // @ts-expect-error fixme: auto ignored
        return orderItems.map((orderItem) => ({
            title: orderItem.title,
            status: this.translateOrderItemType(orderItem.type, orderItem.handout),
            deadline: orderItem.type === "rent" || orderItem.type === "extend"
                ? // @ts-expect-error fixme: auto ignored
                    DateService.toPrintFormat(orderItem.info.to, "Europe/Oslo")
                : null,
            price: orderItem.type !== "return" && orderItem.amount
                ? orderItem.amount.toString()
                : null,
        }));
    }
    stripTo4LastDigits(cardNumber) {
        return cardNumber && cardNumber.length > 4
            ? cardNumber.slice(-4)
            : cardNumber;
    }
    translatePaymentConfirmed() {
        return this.localeSetting === "nb" ? "bekreftet" : "confirmed";
    }
    translateOrderItemType(orderItemType, handout) {
        if (this.localeSetting === "nb") {
            const translations = {
                rent: "lån",
                return: "returnert",
                extend: "forlenget",
                cancel: "kansellert",
                buy: "kjøp",
                "partly-payment": "delbetaling",
                buyback: "tilbakekjøp",
                buyout: "utkjøp",
            };
            // @ts-expect-error fixme: auto ignored
            return `${translations[orderItemType] ?? orderItemType}${handout && orderItemType !== "return" ? " - utlevert" : ""}`;
        }
        return orderItemType;
    }
    async shouldSendAgreement(order, customerDetail, branchId) {
        // @ts-expect-error fixme: auto ignored
        const onlyHandout = order.orderItems[0].handout;
        const rentFound = order.orderItems.some((orderItem) => orderItem.type === "rent");
        if (onlyHandout) {
            return false;
        }
        if (!rentFound) {
            return false;
        }
        if (customerDetail.dob &&
            moment(customerDetail.dob).isValid() &&
            moment(customerDetail.dob).isAfter(moment(new Date()).subtract(18, "years"))) {
            return true; // the user is under the age of 18
        }
        return await this.isBranchResponsible(branchId);
    }
    isBranchResponsible(branchId) {
        return BlStorage.Branches.get(branchId)
            .then((branch) => {
            // @ts-expect-error fixme: auto ignored
            return branch.paymentInfo.responsible;
        })
            .catch((getBranchError) => {
            throw new BlError("could not get branch").add(getBranchError);
        });
    }
}
