import { PermissionService } from "@backend/auth/permission.service.js";
import { test } from "@japa/runner";
import { BlDocument } from "@shared/bl-document/bl-document.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("PermissionSerivice", async () => {
  test("should return true if document.user.id is the same as userId even if UserPermission is not correct", async () => {
    const userId = "aabc";
    const doc: BlDocument = {
      id: "doc1",
      user: { id: userId, permission: "admin" },
    };

    expect(
      PermissionService.haveRestrictedDocumentPermission(
        userId,
        "customer",
        doc,
      ),
    ).to.be.true;
  });

  test("should return false if userId is not equal to document.user.id and UserPermission is not valid", async () => {
    const userId = "abc";
    const doc: BlDocument = {
      id: "doc1",
      user: { id: "123", permission: "admin" },
    };

    expect(
      PermissionService.haveRestrictedDocumentPermission(
        userId,
        "employee",
        doc,
      ),
    ).to.be.false;
  });

  test("should return false if userId is not equal to document.user.id and user.permission is customer", async () => {
    const userId = "abc";
    const doc: BlDocument = {
      id: "doc1",
      user: { id: "123", permission: "admin" },
    };
    expect(
      PermissionService.haveRestrictedDocumentPermission(
        userId,
        "employee",
        doc,
      ),
    ).to.be.false;
  });

  test("should return true if userId is not equal to document.user.id but UserPermission is over the document.user.permission", async () => {
    const userId = "abc";
    const doc: BlDocument = {
      id: "123",
      user: { id: "123", permission: "employee" },
    };

    expect(
      PermissionService.haveRestrictedDocumentPermission(userId, "admin", doc),
    ).to.be.true;
  });
});
