import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import CollectionEndpointDocumentAuth from "#services/legacy/collection-endpoint/collection-endpoint-document-auth";
import { BlStorageData } from "#services/storage_service";
import { BlError } from "#shared/bl-error";
import { Branch } from "#shared/branch";
import { BlApiRequest } from "#types/bl-api-request";
import {
  BlDocumentPermission,
  BlEndpointRestriction,
} from "#types/bl-collection";

chaiUse(chaiAsPromised);
should();

test.group("CollectionEndpointDocumentAuth", (group) => {
  let testBlApiRequest: BlApiRequest;
  let testDocs: BlStorageData;
  let testRestriction: BlEndpointRestriction;

  group.each.setup(() => {
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

  test("should reject if blApiRequest is null or undefined", async () => {
    return expect(
      // @ts-expect-error fixme: auto ignored
      CollectionEndpointDocumentAuth.validate(testRestriction, testDocs, null),
    ).to.be.rejectedWith(BlError, /blApiRequest is null or undefined/);
  });

  test("should resolve if blApiRequest.user.id is equal to document.user.id", async () => {
    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.id = "user1";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.id = "user1";

    return expect(
      CollectionEndpointDocumentAuth.validate(
        testRestriction,
        testDocs,
        testBlApiRequest,
      ),
    ).to.be.fulfilled;
  });

  test("should reject if user permission is equal or lower to document.user.permission and document permission on endpoint", async () => {
    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.id = "user2";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.id = "user1";
    const documentPermission: BlDocumentPermission = {
      viewableForPermission: "manager",
    };

    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.permission = "employee";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.permission = "manager";

    return expect(
      CollectionEndpointDocumentAuth.validate(
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

  test("should resolve if user permission is equal or higher than documentPermission", async () => {
    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.id = "user2";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.id = "user1";
    const documentPermission: BlDocumentPermission = {
      viewableForPermission: "employee",
    };

    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.permission = "employee";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.permission = "admin"; // the doc was created by a admin, but should be viewable for a employee also

    return expect(
      CollectionEndpointDocumentAuth.validate(
        testRestriction,
        testDocs,
        testBlApiRequest,
        documentPermission,
      ),
    ).to.be.fulfilled;
  });

  test("should reject if blApiRequest.user.permission is equal or lower to document.user.permission", async () => {
    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.id = "user2";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.id = "user1";
    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.permission = "customer";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.permission = "employee";

    return expect(
      CollectionEndpointDocumentAuth.validate(
        testRestriction,
        testDocs,
        testBlApiRequest,
      ),
    ).to.be.rejectedWith(
      BlError,
      /lacking restricted permission to view or edit the document/,
    );
  });

  test("should resolve if blApiRequest.user.permission is higher than document.user.permission", async () => {
    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.id = "user2";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.id = "user1";
    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.permission = "admin";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.permission = "employee";

    return expect(
      CollectionEndpointDocumentAuth.validate(
        testRestriction,
        testDocs,
        testBlApiRequest,
      ),
    ).to.be.fulfilled;
  });

  test("should reject if document.viewableFor does not include blApiRequest.user.id", async () => {
    // @ts-expect-error fixme: auto ignored
    testDocs[0].viewableFor = ["customer1"];
    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.id = "user2";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.id = "user1";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.permission = "admin";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.id = "user1";

    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.id = "user2";

    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.permission = "customer";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].viewableFor = ["user1"];

    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.id = "user2";

    return expect(
      CollectionEndpointDocumentAuth.validate(
        testRestriction,
        testDocs,
        testBlApiRequest,
      ),
    ).to.be.rejectedWith(BlError, /document is not viewable for user/);
  });

  test("should resolve if document.viewableFor does include blApiRequest.user.id", async () => {
    // @ts-expect-error fixme: auto ignored
    testDocs[0].viewableFor = ["customer1"];
    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.id = "user2";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.id = "user1";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.permission = "admin";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].user.id = "user1";

    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.id = "user2";

    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.permission = "customer";
    // @ts-expect-error fixme: auto ignored
    testDocs[0].viewableFor = ["user4"];

    // @ts-expect-error fixme: auto ignored
    testBlApiRequest.user.id = "user4";

    return expect(
      CollectionEndpointDocumentAuth.validate(
        testRestriction,
        testDocs,
        testBlApiRequest,
      ),
    ).to.be.fulfilled;
  });
});
