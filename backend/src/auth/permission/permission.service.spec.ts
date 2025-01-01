import "mocha";
import { PermissionService } from "@backend/auth/permission/permission.service";
import { BlEndpointRestriction } from "@backend/collections/bl-collection";
import { BlDocument } from "@shared/bl-document/bl-document";
import { UserPermission } from "@shared/permission/user-permission";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("PermissionSerivice", () => {
  const permissionService: PermissionService = new PermissionService();

  describe("#haveRestrictedDocumentPermission()", () => {
    it("should return true if document.user.id is the same as userId even if UserPermission is not correct", () => {
      const userId = "aabc";
      const doc: BlDocument = {
        id: "doc1",
        user: { id: userId, permission: "admin" },
      };
      const endpointRestriction = {} as BlEndpointRestriction;

      expect(
        permissionService.haveRestrictedDocumentPermission(
          userId,
          "customer",
          doc,
          endpointRestriction,
        ),
      ).to.be.true;
    });

    it("should return false if userId is not equal to document.user.id and UserPermission is not valid", () => {
      const userId = "abc";
      const doc: BlDocument = {
        id: "doc1",
        user: { id: "123", permission: "admin" },
      };
      const endpointRestriction = {} as BlEndpointRestriction;

      expect(
        permissionService.haveRestrictedDocumentPermission(
          userId,
          "employee",
          doc,
          endpointRestriction,
        ),
      ).to.be.false;
    });

    it("should return false if userId is not equal to document.user.id and user.permission is customer", () => {
      const userId = "abc";
      const doc: BlDocument = {
        id: "doc1",
        user: { id: "123", permission: "admin" },
      };
      const endpointRestriction = {} as BlEndpointRestriction;
      expect(
        permissionService.haveRestrictedDocumentPermission(
          userId,
          "employee",
          doc,
          endpointRestriction,
        ),
      ).to.be.false;
    });

    it("should return true if userId is not equal to document.user.id but UserPermission is over the document.user.permission", () => {
      const userId = "abc";
      const doc: BlDocument = {
        id: "123",
        user: { id: "123", permission: "employee" },
      };
      const endpointRestriction = {} as BlEndpointRestriction;

      expect(
        permissionService.haveRestrictedDocumentPermission(
          userId,
          "admin",
          doc,
          endpointRestriction,
        ),
      ).to.be.true;
    });
  });
});
