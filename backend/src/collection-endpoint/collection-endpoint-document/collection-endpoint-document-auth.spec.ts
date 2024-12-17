import "mocha";
import { CollectionEndpointDocumentAuth } from "@backend/collection-endpoint/collection-endpoint-document/collection-endpoint-document-auth";
import {
  BlDocumentPermission,
  BlEndpointRestriction,
} from "@backend/collections/bl-collection";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlDocument } from "@shared/bl-document/bl-document";
import { BlError } from "@shared/bl-error/bl-error";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("CollectionEndpointDocumentAuth", () => {
  const collectionEndpointDocumentAuth = new CollectionEndpointDocumentAuth();
  let testBlApiRequest: BlApiRequest;
  let testDocs: BlDocument[];
  let testRestriction: BlEndpointRestriction;

  beforeEach(() => {
    testRestriction = {
      restricted: true,
    } as BlEndpointRestriction;

    testBlApiRequest = {
      user: {
        id: "user1",
        permission: "customer",
        details: "",
      },
    };
    testDocs = [
      {
        id: "doc1",
        user: {
          id: "user1",
          permission: "customer",
        },
      },
    ];
  });

  it("should reject if blApiRequest is null or undefined", () => {
    return expect(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      collectionEndpointDocumentAuth.validate(testRestriction, testDocs, null),
    ).to.be.rejectedWith(BlError, /blApiRequest is null or undefined/);
  });

  it("should resolve if blApiRequest.user.id is equal to document.user.id", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    testBlApiRequest.user.id = "user1"; // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    testDocs[0].user.id = "user1";

    return expect(
      collectionEndpointDocumentAuth.validate(
        testRestriction,
        testDocs,
        testBlApiRequest,
      ),
    ).to.be.fulfilled;
  });

  context("when blApiRequest.user.id is not equal to document.user.id", () => {
    context("when document.viewableFor is not set", () => {
      beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testBlApiRequest.user.id = "user2"; // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testDocs[0].user.id = "user1";
      });

      context(
        "when document permission is present on document endpoint",
        () => {
          it("should reject if user permission is equal or lower to document.user.permission and document permission on endpoint", () => {
            const documentPermission: BlDocumentPermission = {
              viewableForPermission: "manager",
            };
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testBlApiRequest.user.permission = "employee"; // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDocs[0].user.permission = "manager";

            return expect(
              collectionEndpointDocumentAuth.validate(
                testRestriction,
                testDocs,
                testBlApiRequest,
                documentPermission,
              ),
            ).to.be.rejectedWith(
              BlError,
              /lacking restricted permission to view or edit the document/,
            );
          });

          it("should resolve if user permission is equal or higher than documentPermission", () => {
            const documentPermission: BlDocumentPermission = {
              viewableForPermission: "employee",
            };
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testBlApiRequest.user.permission = "employee"; // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDocs[0].user.permission = "admin"; // the doc was created by a admin, but should be viewable for a employee also

            return expect(
              collectionEndpointDocumentAuth.validate(
                testRestriction,
                testDocs,
                testBlApiRequest,
                documentPermission,
              ),
            ).to.be.fulfilled;
          });
        },
      );

      it("should reject if blApiRequest.user.permission is equal or lower to document.user.permission", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testBlApiRequest.user.permission = "customer"; // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testDocs[0].user.permission = "employee";

        return expect(
          collectionEndpointDocumentAuth.validate(
            testRestriction,
            testDocs,
            testBlApiRequest,
          ),
        ).to.be.rejectedWith(
          BlError,
          /lacking restricted permission to view or edit the document/,
        );
      });

      it("should resolve if blApiRequest.user.permission is higher than document.user.permission", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testBlApiRequest.user.permission = "admin"; // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testDocs[0].user.permission = "employee";

        return expect(
          collectionEndpointDocumentAuth.validate(
            testRestriction,
            testDocs,
            testBlApiRequest,
          ),
        ).to.be.fulfilled;
      });
    });

    context("when document.viewableFor is set", () => {
      beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        testDocs[0].viewableFor = ["customer1"];
      });

      context(
        "when blApiRequest.user does not have regular permission to document",
        () => {
          beforeEach(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDocs[0].user.permission = "admin"; // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDocs[0].user.id = "user1";
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testBlApiRequest.user.id = "user2";
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testBlApiRequest.user.permission = "customer";
          });

          it("should reject if document.viewableFor does not include blApiRequest.user.id", () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDocs[0].viewableFor = ["user1"];
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testBlApiRequest.user.id = "user2";

            return expect(
              collectionEndpointDocumentAuth.validate(
                testRestriction,
                testDocs,
                testBlApiRequest,
              ),
            ).to.be.rejectedWith(BlError, /document is not viewable for user/);
          });

          it("should resolve if document.viewableFor does include blApiRequest.user.id", () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testDocs[0].viewableFor = ["user4"];
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            testBlApiRequest.user.id = "user4";

            return expect(
              collectionEndpointDocumentAuth.validate(
                testRestriction,
                testDocs,
                testBlApiRequest,
              ),
            ).to.be.fulfilled;
          });
        },
      );
    });
  });
});
