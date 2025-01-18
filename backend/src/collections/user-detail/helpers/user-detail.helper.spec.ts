import "mocha";
import { UserDetailHelper } from "@backend/collections/user-detail/helpers/user-detail.helper";
import { DibsEasyPayment } from "@backend/payment/dibs/dibs-easy-payment/dibs-easy-payment";
import { BlStorage } from "@backend/storage/bl-storage";
import { BlError } from "@shared/bl-error/bl-error";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon, { createSandbox, SinonSandbox } from "sinon";

chaiUse(chaiAsPromised);
should();

describe("UserDetailHelper", () => {
  let sandbox: SinonSandbox;

  const userDetailHelper = new UserDetailHelper();

  let testUserDetail: UserDetail;
  let userDetailStorageUpdateSuccess: boolean;
  let testAccessToken: AccessToken;

  beforeEach(() => {
    sandbox = createSandbox();

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

    testAccessToken = {
      sub: "user1",
      details: "userDetail1",
    } as AccessToken;

    userDetailStorageUpdateSuccess = true;

    sandbox
      .stub(BlStorage.UserDetails, "update")
      .callsFake((id: string, data: any) => {
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

  afterEach(() => {
    sandbox.restore();
  });

  describe("#updateUserDetailBasedOnDibsEasyPayment", () => {
    let testDibsEasyPayment: any;

    beforeEach(() => {
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
    });

    it("should update userDetail with values from dibsEasyPayment", async () => {
      const updatedUserDetail =
        await userDetailHelper.updateUserDetailBasedOnDibsEasyPayment(
          "userDetail1",
          testDibsEasyPayment as DibsEasyPayment,
        );

      const name =
        testDibsEasyPayment.consumer!.privatePerson!.firstName +
        " " +
        testDibsEasyPayment.consumer!.privatePerson!.lastName;

      expect(updatedUserDetail.name).to.eq(name);
      // and so on...
    });

    it("should only update the fields in userDetail that are not already populated", async () => {
      testUserDetail.name = "Jenny Jensen";
      testDibsEasyPayment.consumer!.privatePerson!["firstName"] = "Johnny";

      const updatedUserDetail =
        await userDetailHelper.updateUserDetailBasedOnDibsEasyPayment(
          "userDetail1",
          testDibsEasyPayment as DibsEasyPayment,
        );

      expect(updatedUserDetail.name).to.eq("Jenny Jensen"); // this value was already stored
      expect(updatedUserDetail.postCity).to.eq(
        testDibsEasyPayment.consumer!.shippingAddress!.city,
      );
    });
  });

  describe("getFirstName()", () => {
    // ...
  });

  describe("getLastName()", () => {
    // ...
  });
});
