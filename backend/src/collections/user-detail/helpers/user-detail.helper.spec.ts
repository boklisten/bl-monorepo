import "mocha";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { UserDetailHelper } from "@backend/collections/user-detail/helpers/user-detail.helper";
import { DibsEasyPayment } from "@backend/payment/dibs/dibs-easy-payment/dibs-easy-payment";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("UserDetailHelper", () => {
  const userDetailStorage = new BlDocumentStorage<UserDetail>(
    BlCollectionName.UserDetails,
  );
  const userDetailHelper = new UserDetailHelper(userDetailStorage);

  let testUserDetail: UserDetail;
  let userDetailStorageUpdateSuccess: boolean;
  let testAccessToken: AccessToken;

  beforeEach(() => {
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
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userDetailStorageUpdateStub = sinon
    .stub(userDetailStorage, "update") // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .callsFake((id: string, data: any, user: any) => {
      if (!userDetailStorageUpdateSuccess) {
        return Promise.reject(new BlError("could not update"));
      }

      const returnObj = Object.assign(testUserDetail, data);
      return Promise.resolve(returnObj);
    });

  sinon.stub(userDetailStorage, "get").callsFake((id: string) => {
    if (id !== testUserDetail.id) {
      return Promise.reject(new BlError("not found"));
    }

    return Promise.resolve(testUserDetail);
  });

  describe("#updateUserDetailBasedOnDibsEasyPayment", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let testDibsEasyPayment;

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

    it("should update userDetail with values from dibsEasyPayment", (done) => {
      userDetailHelper
        .updateUserDetailBasedOnDibsEasyPayment(
          "userDetail1",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testDibsEasyPayment as DibsEasyPayment,
          testAccessToken,
        )
        .then((updatedUserDetail: UserDetail) => {
          const name =
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDibsEasyPayment.consumer.privatePerson.firstName +
            " " +
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDibsEasyPayment.consumer.privatePerson.lastName;

          expect(updatedUserDetail.name).to.eq(name);
          expect(updatedUserDetail.phone).to.eq(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDibsEasyPayment.consumer.privatePerson.phoneNumber.number,
          );
          expect(updatedUserDetail.postCode).to.eq(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDibsEasyPayment.consumer.shippingAddress.postalCode,
          );
          expect(updatedUserDetail.postCity).to.eql(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDibsEasyPayment.consumer.shippingAddress.city,
          );

          const expectedAddress =
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDibsEasyPayment.consumer.shippingAddress.addressLine1 +
            " " +
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDibsEasyPayment.consumer.shippingAddress.addressLine2;
          expect(updatedUserDetail.address).to.eql(expectedAddress);

          done();
        });
    });

    it("should only update the fields in userDetail that are not already populated", (done) => {
      testUserDetail.name = "Jenny Jensen";

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      testDibsEasyPayment.consumer.privatePerson["firstName"] = "Johnny";

      userDetailHelper
        .updateUserDetailBasedOnDibsEasyPayment(
          "userDetail1",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          testDibsEasyPayment,
          testAccessToken,
        )
        .then((updatedUserDetail: UserDetail) => {
          expect(updatedUserDetail.name).to.eq("Jenny Jensen"); // this value was already stored
          expect(updatedUserDetail.postCity).to.eq(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDibsEasyPayment.consumer.shippingAddress.city,
          ); // this value was empty, should set it from dibsPayment
          done();
        });
    });
  });
  describe("getFirstName()", () => {
    it("should resolve with first name", (done) => {
      const names: { n: string; f: string }[] = [
        { n: "Albert Einstein", f: "Albert" },
        { n: "Willy-Wonk Wonka", f: "Willy-Wonk" },
        { n: "Einar", f: "Einar" },
        { n: "", f: "" },
        { n: "S Hansen", f: "S" },
        { n: "Billy  Bob", f: "Billy" },
        { n: "Negil Veganer ", f: "Negil" },
        { n: " Bobby Bobson", f: "Bobby" },
        { n: "       Bobby Bobson", f: "Bobby" },
        { n: "       Bobby            Bobson", f: "Bobby" },
      ];

      for (const name of names) {
        expect(userDetailHelper.getFirstName(name.n)).to.eq(name.f);
      }
      done();
    });
  });

  describe("getLastName()", () => {
    it("should resolve with last name", (done) => {
      const names: { n: string; f: string }[] = [
        { n: "Albert Einstein", f: "Einstein" },
        { n: "Willy-Wonk Wonka", f: "Wonka" },
        { n: "Einar", f: "" },
        { n: "", f: "" },
        { n: "S Hansen", f: "Hansen" },
        { n: "Wiliam Jens-book Jensen", f: "Jensen" },
        { n: "Birger  Ruud", f: "Ruud" },
        { n: "Jens Hansen ", f: "Hansen" },
        { n: "     Bjorn   Belto ", f: "Belto" },
      ];

      for (const name of names) {
        expect(userDetailHelper.getLastName(name.n)).to.eq(name.f);
      }
      done();
    });
  });
});
