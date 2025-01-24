import { isNullish } from "@backend/lib/helper/typescript-helpers.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class OrderItemPartlyPaymentValidator {
    validate(orderItem, 
    // @ts-expect-error fixme: auto ignored
    Item, branch) {
        if (orderItem.type !== "partly-payment") {
            return Promise.reject(new BlError("orderItem not of type 'partly-payment'"));
        }
        try {
            this.validateFields(orderItem);
        }
        catch (error) {
            return Promise.reject(error);
        }
        // @ts-expect-error fixme: auto ignored
        if (!this.isPeriodSupported(orderItem.info.periodType, branch)) {
            return Promise.reject(new BlError(
            // @ts-expect-error fixme: auto ignored
            `partly-payment period "${orderItem.info.periodType}" not supported on branch`));
        }
        return new Promise((resolve) => {
            resolve(true);
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isPeriodSupported(period, branch) {
        if (branch.paymentInfo && branch.paymentInfo.partlyPaymentPeriods) {
            for (const partlyPaymentPeriod of branch.paymentInfo
                .partlyPaymentPeriods) {
                if (partlyPaymentPeriod.type === period) {
                    return true;
                }
            }
        }
        return false;
    }
    validateFields(orderItem) {
        if (isNullish(orderItem.info)) {
            throw new BlError("orderItem.info not specified");
        }
        if (orderItem.info && isNullish(orderItem.info.to)) {
            throw new BlError("orderItem.info.to not specified");
        }
        if (orderItem.info &&
            // @ts-expect-error fixme: auto ignored
            isNullish(orderItem.info["amountLeftToPay"])) {
            throw new BlError("orderItem.info.amountLeftToPay not specified");
        }
    }
}
