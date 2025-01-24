import { DeliveryBranchHandler } from "@backend/lib/collections/delivery/helpers/deliveryBranch/delivery-branch-handler.js";
import { DeliveryBringHandler } from "@backend/lib/collections/delivery/helpers/deliveryBring/delivery-bring-handler.js";
import { DeliveryValidator } from "@backend/lib/collections/delivery/helpers/deliveryValidator/delivery-validator.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
chaiUse(chaiAsPromised);
should();
test.group("DeliveryValidator", (group) => {
    let testDelivery;
    let testOrder;
    const deliveryBranchHandler = new DeliveryBranchHandler();
    const deliveryBringHandler = new DeliveryBringHandler();
    const deliveryValidator = new DeliveryValidator(deliveryBranchHandler, deliveryBringHandler);
    let deliveryBranchValidation = true;
    let deliveryBringValidation = true;
    let sandbox;
    group.each.setup(() => {
        sandbox = createSandbox();
        sandbox.stub(BlStorage.Orders, "get").callsFake((id) => {
            if (id !== testOrder.id) {
                return Promise.reject(new BlError("not found").code(702));
            }
            return Promise.resolve(testOrder);
        });
        sandbox.stub(deliveryBranchHandler, "validate").callsFake(() => {
            if (!deliveryBranchValidation) {
                return Promise.reject(new BlError('validation of delivery.method "branch" failed'));
            }
            return Promise.resolve(true);
        });
        sandbox.stub(deliveryBringHandler, "validate").callsFake(() => {
            if (!deliveryBringValidation) {
                return Promise.reject(new BlError('validation of delivery.method "bring" failed'));
            }
            return Promise.resolve(true);
        });
        testDelivery = {
            id: "delivery1",
            method: "branch",
            info: {
                branch: "branch1",
            },
            order: "order1",
            amount: 0,
        };
        testOrder = {
            id: "order1",
            amount: 100,
            branch: "branch1",
            customer: "customer1",
            byCustomer: true,
            orderItems: [],
            pendingSignature: false,
        };
    });
    group.each.teardown(() => {
        sandbox.restore();
    });
    test("should reject with error when method is not defined", async () => {
        // @ts-expect-error fixme: auto ignored
        testDelivery.method = null;
        return expect(deliveryValidator.validate(testDelivery)).to.be.rejectedWith(BlError, /delivery.method not defined/);
    });
    test("should reject if delivery.method is branch and DeliveryBranchHandler.validate rejects", async () => {
        deliveryBranchValidation = false;
        testDelivery.method = "branch";
        return expect(deliveryValidator.validate(testDelivery)).to.be.rejectedWith(BlError, /validation of delivery.method "branch" failed/);
    });
    test("should reject if delivery.method is bring and DeliveryBringHandler.validate rejects", async () => {
        deliveryBringValidation = false;
        testDelivery.method = "bring";
        return expect(deliveryValidator.validate(testDelivery)).to.be.rejectedWith(BlError, /validation of delivery.method "bring" failed/);
    });
});
