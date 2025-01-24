import { DibsPaymentService } from "@backend/lib/payment/dibs/dibs-payment.service.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export class PaymentDibsHandler {
    dibsPaymentService;
    constructor(dibsPaymentService) {
        this.dibsPaymentService = dibsPaymentService
            ? dibsPaymentService
            : new DibsPaymentService();
    }
    async handleDibsPayment(payment) {
        const order = await BlStorage.Orders.get(payment.order);
        const userDetail = await BlStorage.UserDetails.get(payment.customer);
        const dibsEasyOrder = await this.getDibsEasyOrder(userDetail, order);
        const paymentId = await this.dibsPaymentService.getPaymentId(dibsEasyOrder);
        return await BlStorage.Payments.update(payment.id, {
            info: { paymentId: paymentId },
        });
    }
    getDibsEasyOrder(userDetail, order) {
        if (order.delivery) {
            return BlStorage.Deliveries.get(order.delivery).then((delivery) => {
                return this.dibsPaymentService.orderToDibsEasyOrder(userDetail, order, delivery);
            });
        }
        return Promise.resolve(this.dibsPaymentService.orderToDibsEasyOrder(userDetail, order));
    }
}
