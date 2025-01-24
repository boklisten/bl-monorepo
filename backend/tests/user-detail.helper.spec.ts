import { UserDetailHelper } from "@backend/lib/collections/user-detail/helpers/user-detail.helper.js";
import { DibsEasyPayment } from "@backend/lib/payment/dibs/dibs-easy-payment/dibs-easy-payment.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { test } from "@japa/runner";
import { BlError } from "@shared/bl-error/bl-error.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox, SinonSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

test.group("UserDetailHelper", (group) => {
  let sandbox: SinonSandbox;

  const userDetailHelper = new UserDetailHelper();

  let testUserDetail: UserDetail;
  let userDetailStorageUpdateSuccess: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let testDibsEasyPayment: any;

  group.each.setup(() => {
    sandbox = createSandbox();
    testDibsEasyPayment = {
      consumer: {
        privatePerson: {
          email: "bill@blapi.co",
          firstName: "Billy",
          lastName: "Joel",
          merchantReference: "ref123",
          phoneNumber: {
            number: "12345678",
            prefix: "+47",
          },
        },
        shippingAddress: {
          addressLine1: "Trondheimsveien 10",
          addressLine2: "HO403",
          city: "OSLO",
          country: "NOR",
          postalCode: "0560",
        },
      },
    };
    testUserDetail = {
      id: "userDetail1",
      name: "",
      email: "bill@blapi.co",
      phone: "",
      address: "",
      postCode: "",
      postCity: "",
      country: "",
      dob: new Date(),
      branch: "branch1",
      signatures: [],
      blid: "",
    };

    userDetailStorageUpdateSuccess = true;

    sandbox.stub(BlStorage.UserDetails, "update").callsFake((id, data) => {
      if (!userDetailStorageUpdateSuccess) {
        return Promise.reject(new BlError("could not update"));
      }
      const returnObj = Object.assign(testUserDetail, data);
      return Promise.resolve(returnObj);
    });

    sandbox.stub(BlStorage.UserDetails, "get").callsFake((id) => {
      if (id !== testUserDetail.id) {
        return Promise.reject(new BlError("not found"));
      }
      return Promise.resolve(testUserDetail);
    });
  });

  group.each.teardown(() => {
    sandbox.restore();
  });

  test(".updateUserDetailBasedOnDibsEasyPayment() should update userDetail with values from dibsEasyPayment", async () => {
    const updatedUserDetail =
      await userDetailHelper.updateUserDetailBasedOnDibsEasyPayment(
        "userDetail1",
        testDibsEasyPayment as DibsEasyPayment,
      );

    const name =
      testDibsEasyPayment.consumer.privatePerson.firstName +
      " " +
      testDibsEasyPayment.consumer.privatePerson.lastName;

    expect(updatedUserDetail.name).to.eq(name);
    // and so on...
  });

  test(".updateUserDetailBasedOnDibsEasyPayment() should only update the fields in userDetail that are not already populated", async () => {
    testUserDetail.name = "Jenny Jensen";
    testDibsEasyPayment.consumer.privatePerson["firstName"] = "Johnny";

    const updatedUserDetail =
      await userDetailHelper.updateUserDetailBasedOnDibsEasyPayment(
        "userDetail1",
        testDibsEasyPayment as DibsEasyPayment,
      );

    expect(updatedUserDetail.name).to.eq("Jenny Jensen"); // this value was already stored
    expect(updatedUserDetail.postCity).to.eq(
      testDibsEasyPayment.consumer.shippingAddress.city,
    );
  });
});
