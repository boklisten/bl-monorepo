import { isNullish } from "@backend/lib/helper/typescript-helpers.js";
import { DibsPaymentService } from "@backend/lib/payment/dibs/dibs-payment.service.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class PaymentDibsConfirmer {
    dibsPaymentService;
    constructor(dibsPaymentService) {
        this.dibsPaymentService = dibsPaymentService ?? new DibsPaymentService();
    }
    async confirm(order, payment) {
        let dibsEasyPaymentDetails;
        if (payment.amount >= 0) {
            this.validatePaymentInfo(payment);
            try {
                dibsEasyPaymentDetails =
                    await this.dibsPaymentService.fetchDibsPaymentData(
                    // @ts-expect-error fixme: auto ignored
                    payment.info["paymentId"]);
            }
            catch (getDibsPaymentError) {
                throw new BlError("could not get dibs payment from dibs api").add(
                // @ts-expect-error fixme: auto ignored
                getDibsPaymentError);
            }
            this.validateDibsEasyPayment(order, payment, dibsEasyPaymentDetails);
        }
        try {
            await BlStorage.Payments.update(payment.id, 
            // @ts-expect-error fixme: auto ignored
            { info: dibsEasyPaymentDetails });
        }
        catch (error) {
            throw new BlError("payment could not be updated with dibs information:" + error);
        }
        return true;
    }
    validateDibsEasyPayment(order, payment, dibsEasyPaymentDetails) {
        if (isNullish(dibsEasyPaymentDetails.orderDetails) ||
            dibsEasyPaymentDetails.orderDetails.reference !== order.id) {
            throw new BlError("dibsEasyPaymentDetails.orderDetails.reference is not equal to order.id");
        }
        if (isNullish(dibsEasyPaymentDetails.summary) ||
            isNullish(dibsEasyPaymentDetails.summary.reservedAmount) ||
            Number.parseInt("" + dibsEasyPaymentDetails.summary.reservedAmount, 10) !==
                payment.amount * 100) {
            throw new BlError(`dibsEasyPaymentDetails.summary.reservedAmount "${dibsEasyPaymentDetails.summary.reservedAmount}" is not equal to payment.amount "${payment.amount * 100}"`);
        }
        return false;
    }
    validatePaymentInfo(payment) {
        if (isNullish(payment.info) ||
            // @ts-expect-error fixme: auto ignored
            isNullish(payment.info["paymentId"])) {
            throw new BlError('payment.method is "dibs" but payment.info.paymentId is undefined');
        }
        return true;
    }
}
