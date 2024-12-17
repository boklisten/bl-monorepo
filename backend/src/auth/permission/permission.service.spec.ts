import "mocha";
import { BlDocument, UserPermission } from "@boklisten/bl-model";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { PermissionService } from "@/auth/permission/permission.service";
import { BlEndpointRestriction } from "@/collections/bl-collection";

chai.use(chaiAsPromised);

describe("PermissionSerivice", () => {
  const permissionService: PermissionService = new PermissionService();

  describe("#getLowestPermission()", () => {
    it("should return Customer if customer is the lowest permission in array", () => {
      const permissions: UserPermission[] = ["customer", "admin"];

      expect(permissionService.getLowestPermission(permissions)).to.eql(
        "customer",
      );
    });

    it("should return Customer even if customer is the last element in array", () => {
      const permissions: UserPermission[] = ["admin", "employee", "customer"];

      expect(permissionService.getLowestPermission(permissions)).to.eql(
        "customer",
      );
    });

    it("should return employee if that is the lowest permission", () => {
      const permissions: UserPermission[] = ["admin", "employee"];

      expect(permissionService.getLowestPermission(permissions)).to.eql(
        "employee",
      );
    });

    it("should return admin if that is the lowest permission", () => {
      expect(permissionService.getLowestPermission(["admin"])).to.eq("admin");
    });
  });

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
