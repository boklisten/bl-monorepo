import "mocha";
import { CollectionEndpointDocumentAuth } from "@backend/collection-endpoint/collection-endpoint-document/collection-endpoint-document-auth.js";
import {
  BlDocumentPermission,
  BlEndpointRestriction,
} from "@backend/collections/bl-collection.js";
import { BlApiRequest } from "@backend/request/bl-api-request.js";
import { BlStorageData } from "@backend/storage/bl-storage.js";
import { BlDocument } from "@shared/bl-document/bl-document.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Branch } from "@shared/branch/branch.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("CollectionEndpointDocumentAuth", () => {
  const collectionEndpointDocumentAuth = new CollectionEndpointDocumentAuth();
  let testBlApiRequest: BlApiRequest;
  let testDocs: BlStorageData;
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
      } as Branch,
    ];
  });

  it("should reject if blApiRequest is null or undefined", () => {
    return expect(
      // @ts-expect-error fixme: auto ignored
      collectionEndpointDocumentAuth.validate(testRestriction, testDocs, null),
    ).to.be.rejectedWith(BlError, /blApiRequest is null or undefined/);
  });

  it("should resolve if blApiRequest.user.id is equal to document.user.id", () => {
    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.id = "user1";
    // @ts-expect-error fixme: auto ignored
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
        // @ts-expect-error fixme: auto ignored
        testBlApiRequest.user.id = "user2";
        // @ts-expect-error fixme: auto ignored
        testDocs[0].user.id = "user1";
      });

      context(
        "when document permission is present on document endpoint",
        () => {
          it("should reject if user permission is equal or lower to document.user.permission and document permission on endpoint", () => {
            const documentPermission: BlDocumentPermission = {
              viewableForPermission: "manager",
            };

            // @ts-expect-error fixme: auto ignored
            testBlApiRequest.user.permission = "employee";
            // @ts-expect-error fixme: auto ignored
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

            // @ts-expect-error fixme: auto ignored
            testBlApiRequest.user.permission = "employee";
            // @ts-expect-error fixme: auto ignored
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
        // @ts-expect-error fixme: auto ignored
        testBlApiRequest.user.permission = "customer";
        // @ts-expect-error fixme: auto ignored
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
        // @ts-expect-error fixme: auto ignored
        testBlApiRequest.user.permission = "admin";
        // @ts-expect-error fixme: auto ignored
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
        // @ts-expect-error fixme: auto ignored
        testDocs[0].viewableFor = ["customer1"];
      });

      context(
        "when blApiRequest.user does not have regular permission to document",
        () => {
          beforeEach(() => {
            // @ts-expect-error fixme: auto ignored
            testDocs[0].user.permission = "admin";
            // @ts-expect-error fixme: auto ignored
            testDocs[0].user.id = "user1";

            // @ts-expect-error fixme: auto ignored
            testBlApiRequest.user.id = "user2";

            // @ts-expect-error fixme: auto ignored
            testBlApiRequest.user.permission = "customer";
          });

          it("should reject if document.viewableFor does not include blApiRequest.user.id", () => {
            // @ts-expect-error fixme: auto ignored
            testDocs[0].viewableFor = ["user1"];

            // @ts-expect-error fixme: auto ignored
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
            // @ts-expect-error fixme: auto ignored
            testDocs[0].viewableFor = ["user4"];

            // @ts-expect-error fixme: auto ignored
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
