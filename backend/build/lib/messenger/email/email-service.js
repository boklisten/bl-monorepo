import { DateService } from "@backend/lib/blc/date.service.js";
import { BlEnv } from "@backend/lib/config/env.js";
import { logger } from "@backend/lib/config/logger.js";
import { EMAIL_SETTINGS } from "@backend/lib/messenger/email/email-settings.js";
import { OrderEmailHandler } from "@backend/lib/messenger/email/order-email/order-email-handler.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { EmailHandler } from "@boklisten/bl-email";
import { postOffice, } from "@boklisten/bl-post-office";
import sgMail from "@sendgrid/mail";
import { BlError } from "@shared/bl-error/bl-error.js";
import { MessageMethod } from "@shared/message/message-method/message-method.js";
export class EmailService {
    emailHandler;
    orderEmailHandler;
    postOffice;
    constructor(emailHandler, inputPostOffice) {
        sgMail.setApiKey(BlEnv.SENDGRID_API_KEY);
        this.emailHandler =
            emailHandler ??
                new EmailHandler({
                    sendgrid: {
                        apiKey: BlEnv.SENDGRID_API_KEY,
                    },
                    locale: "nb",
                });
        this.orderEmailHandler = new OrderEmailHandler(this.emailHandler);
        this.postOffice = inputPostOffice ?? postOffice;
        this.postOffice.overrideLogger(logger);
        this.postOffice.setConfig({
            reminder: { mediums: { email: true, sms: true } },
            generic: { mediums: { email: true } },
            receipt: { mediums: { email: false, sms: false } },
        });
    }
    send(message, customerDetail) {
        if (message.messageType === "generic") {
            return this.sendGeneric(message, customerDetail);
        }
        throw `message type "${message.messageType}" not supported`;
    }
    async sendGeneric(message, customerDetail) {
        const recipient = await this.customerDetailToRecipient(message, customerDetail, []);
        const messageOptions = {
            type: "generic",
            subtype: "none",
            subject: message.subject ?? "",
            sequence_number: message.sequenceNumber ?? 0,
            htmlContent: message.htmlContent ?? "",
            textBlocks: message.textBlocks ?? [],
            mediums: this.getMessageOptionMediums(message),
        };
        try {
            await this.postOffice.send([recipient], messageOptions);
        }
        catch (error) {
            logger.error(`could not send generic mail: ${error}`);
        }
    }
    /**
     * Sends out a reminder to the email specified in customerDetail
     * The email will include the customerItems with the deadline
     * @param message message the email service should update on later actions
     * @param customerDetail the customer to send email to
     * @param customerItems a list of customerItems to include in the email
     */
    async remind(message, customerDetail, customerItems) {
        const recipient = await this.customerDetailToRecipient(message, customerDetail, customerItems);
        const messageOptions = {
            type: message.messageType,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            subtype: message.messageSubtype,
            sequence_number: message.sequenceNumber ?? 0,
            textBlocks: message.textBlocks ?? [],
            mediums: this.getMessageOptionMediums(message),
            customContent: message.customContent ?? "",
        };
        try {
            await this.postOffice.send([recipient], messageOptions);
            if (customerDetail.dob &&
                customerDetail.guardian &&
                !DateService.isOver18(customerDetail.dob)) {
                await this.sendToGuardian(customerDetail, recipient, messageOptions);
            }
            return true;
        }
        catch (error) {
            logger.error(`could not send reminder: ${error}`);
            return true;
        }
    }
    async sendToGuardian(customerDetail, recipient, messageOptions) {
        if (!customerDetail.guardian ||
            !customerDetail.guardian.email ||
            !customerDetail.guardian.phone) {
            return false;
        }
        recipient.email = customerDetail.guardian.email;
        recipient.phone = "+47" + customerDetail.guardian.phone;
        return this.postOffice.send([recipient], messageOptions);
    }
    getMessageOptionMediums(message) {
        switch (message.messageMethod) {
            case MessageMethod.EMAIL: {
                return { email: true, sms: false, voice: false };
            }
            case MessageMethod.SMS: {
                return { email: false, sms: true, voice: false };
            }
            default: {
                return {
                    email: false,
                    sms: false,
                    voice: false,
                };
            }
        }
    }
    async orderPlaced(customerDetail, order) {
        await this.orderEmailHandler.sendOrderReceipt(customerDetail, order);
    }
    async customerDetailToRecipient(message, customerDetail, customerItems) {
        return {
            message_id: message.id,
            user_id: customerDetail.id,
            email: customerDetail.email,
            name: customerDetail.name,
            phone: "+47" + customerDetail.phone,
            settings: {
                text: {
                    deadline: message.info
                        ? // @ts-expect-error fixme: auto ignored
                            this.formatDeadline(message.info["deadline"])
                        : "",
                },
            },
            itemList: await this.customerItemsToItemList(message, customerItems),
        };
    }
    async customerItemsToItemList(message, customerItems) {
        if (message.messageSubtype === "partly-payment") {
            return {
                summary: {
                    total: this.getCustomerItemLeftToPayTotal(customerItems).toString() +
                        " NOK",
                    totalTax: "0 NOK",
                    taxPercentage: "0",
                },
                items: await this.customerItemsToEmailItems(message, customerItems),
            };
        }
        else {
            return {
                summary: {
                    // @ts-expect-error fixme: auto ignored
                    total: null,
                    // @ts-expect-error fixme: auto ignored
                    totalTax: null,
                    // @ts-expect-error fixme: auto ignored
                    taxPercentage: null,
                },
                items: await this.customerItemsToEmailItems(message, customerItems),
            };
        }
    }
    async customerItemsToEmailItems(message, customerItems) {
        const items = [];
        for (const customerItem of customerItems) {
            const item = await BlStorage.Items.get(customerItem.item);
            items.push(this.customerItemToEmailItem(message, customerItem, item));
        }
        return items;
    }
    customerItemToEmailItem(message, customerItem, item) {
        if (message.messageSubtype === "partly-payment") {
            return {
                id: item.info.isbn.toString(),
                title: item.title,
                // @ts-expect-error fixme: auto ignored
                deadline: this.formatDeadline(message.info["deadline"]),
                leftToPay: customerItem.amountLeftToPay + " NOK",
            };
        }
        else {
            return {
                id: item.info.isbn.toString(),
                title: item.title,
                // @ts-expect-error fixme: auto ignored
                deadline: this.formatDeadline(message.info["deadline"]),
            };
        }
    }
    formatDeadline(deadline) {
        return deadline == undefined
            ? ""
            : DateService.toPrintFormat(deadline, "Europe/Oslo");
    }
    getCustomerItemLeftToPayTotal(customerItems) {
        return customerItems.reduce(
        // @ts-expect-error fixme: auto ignored
        (total, next) => total + next.amountLeftToPay, 0);
    }
    async deliveryInformation(customerDetail, order, delivery) {
        const emailSetting = {
            toEmail: customerDetail.email,
            fromEmail: EMAIL_SETTINGS.types.deliveryInformation.fromEmail,
            subject: EMAIL_SETTINGS.types.deliveryInformation.subject,
            userId: customerDetail.id,
            textBlocks: [
                {
                    text: "Dine bøker er nå på vei! De vil bli levert til deg ved hjelp av Bring.",
                },
                {
                    text: "Vi anser nå disse bøkene som utlevert. Du er ansvarlig for bøkene fra du henter dem på postkontoret til innlevering er gjennomført. Om noe skulle skje med leveringen er det bare å ta kontakt. Fraktkostnader refunderes ikke for pakker som ikke blir hentet innen fristen.",
                },
            ],
        };
        const emailUser = {
            id: customerDetail.id,
            name: customerDetail.name,
            dob: customerDetail.dob !== undefined && customerDetail.dob !== null
                ? DateService.format(customerDetail.dob, "Europe/Oslo", "DD.MM.YYYY")
                : "",
            email: customerDetail.email,
            address: customerDetail.address,
        };
        let deliveryAddress = "";
        // @ts-expect-error fixme: auto ignored
        if (delivery.info["shipmentAddress"]) {
            // @ts-expect-error fixme: auto ignored
            deliveryAddress = delivery.info["shipmentAddress"].name;
            // @ts-expect-error fixme: auto ignored
            deliveryAddress += ", " + delivery.info["shipmentAddress"].address;
            // @ts-expect-error fixme: auto ignored
            deliveryAddress += ", " + delivery.info["shipmentAddress"].postalCode;
            // @ts-expect-error fixme: auto ignored
            deliveryAddress += " " + delivery.info["shipmentAddress"].postalCity;
        }
        const emailOrder = {
            id: order.id,
            showDeadline: false,
            showPrice: false,
            showStatus: true,
            // @ts-expect-error fixme: auto ignored
            currency: null,
            // @ts-expect-error fixme: auto ignored
            itemAmount: null,
            // @ts-expect-error fixme: auto ignored
            payment: null,
            showPayment: false,
            // @ts-expect-error fixme: auto ignored
            totalAmount: null,
            items: this.orderItemsToDeliveryInformationItems(order.orderItems),
            showDelivery: true,
            delivery: {
                method: "bring",
                // @ts-expect-error fixme: auto ignored
                trackingNumber: delivery.info["trackingNumber"],
                estimatedDeliveryDate: null,
                address: deliveryAddress,
                amount: null,
                currency: null,
            },
        };
        await this.emailHandler
            .sendDelivery(emailSetting, emailOrder, emailUser)
            .catch((error) => {
            throw new BlError("Unable to send delivery email").code(200).add(error);
        });
    }
    orderItemsToDeliveryInformationItems(orderItems) {
        const emailInformaitionItems = [];
        for (const orderItem of orderItems) {
            emailInformaitionItems.push({
                title: orderItem.title,
                status: "utlevering via Bring",
            });
        }
        return emailInformaitionItems;
    }
    async emailConfirmation(customerDetail, confirmationCode) {
        const emailSetting = {
            toEmail: customerDetail.email,
            fromEmail: EMAIL_SETTINGS.types.emailConfirmation.fromEmail,
            subject: EMAIL_SETTINGS.types.emailConfirmation.subject,
            userId: customerDetail.id,
        };
        let emailVerificationUri = BlEnv.CLIENT_URI;
        emailVerificationUri +=
            EMAIL_SETTINGS.types.emailConfirmation.path + confirmationCode;
        await sendMail(emailSetting, EMAIL_SETTINGS.types.emailConfirmation.templateId, {
            emailVerificationUri,
        });
    }
    async passwordReset(userId, userEmail, pendingPasswordResetId, resetToken) {
        const emailSetting = {
            toEmail: userEmail,
            fromEmail: EMAIL_SETTINGS.types.passwordReset.fromEmail,
            subject: EMAIL_SETTINGS.types.passwordReset.subject,
            userId: userId,
        };
        let passwordResetUri = BlEnv.CLIENT_URI;
        passwordResetUri +=
            EMAIL_SETTINGS.types.passwordReset.path +
                pendingPasswordResetId +
                `?resetToken=${resetToken}`;
        await sendMail(emailSetting, EMAIL_SETTINGS.types.passwordReset.templateId, {
            passwordResetUri,
        });
    }
}
export async function sendMail(emailSetting, templateId, dynamicTemplateData = {}) {
    try {
        await sgMail.send({
            from: emailSetting.fromEmail,
            to: emailSetting.toEmail,
            templateId,
            dynamicTemplateData,
        });
        logger.info("Successfully sent email to " + emailSetting.toEmail);
    }
    catch (error) {
        logger.error(`Failed to send email to ${emailSetting.toEmail}, error: ${error}`);
    }
}
