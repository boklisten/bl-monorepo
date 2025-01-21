import "mocha";
import {
  DbQueryValidParams,
  ValidParameter,
} from "@backend/query/db-query-valid-params.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("DbQueryValidParams", () => {
  describe("getValidNumberParams()", () => {
    it("should return empty array if no valid NumberParams is set", () => {
      const dbQueryValidParams: DbQueryValidParams = new DbQueryValidParams([]);
      expect(dbQueryValidParams.getValidNumberParams()).to.eql([]);
    });

    it('should return array like ["name", "desc"] ', () => {
      const validParams: ValidParameter[] = [];
      validParams.push({ fieldName: "age", type: "number" });
      validParams.push({ fieldName: "price", type: "number" });
      const dbQueryValidParams: DbQueryValidParams = new DbQueryValidParams(
        validParams,
      );
      const result = ["age", "price"];

      expect(dbQueryValidParams.getValidNumberParams()).to.eql(result);
    });

    it("should return empty array if none of the validParams are of type number", () => {
      const validParams: ValidParameter[] = [
        { fieldName: "name", type: "string" },
      ];
      const dbQueryValidParams: DbQueryValidParams = new DbQueryValidParams(
        validParams,
      );
      expect(dbQueryValidParams.getValidNumberParams()).to.eql([]);
    });
  });

  describe("getValidStringParams()", () => {
    it("should return string array with names of all validParams with type string", () => {
      const validParams: ValidParameter[] = [
        { fieldName: "name", type: "string" },
        { fieldName: "desc", type: "string" },
      ];
      const dbQuertyValidParams: DbQueryValidParams = new DbQueryValidParams(
        validParams,
      );
      const result = ["name", "desc"];

      expect(dbQuertyValidParams.getValidStringParams()).to.eql(result);
    });

    it('should return empty array if no validParams with type "string" is given', () => {
      const validParams: ValidParameter[] = [
        { fieldName: "age", type: "number" },
      ];

      const dbQueryValidParams: DbQueryValidParams = new DbQueryValidParams(
        validParams,
      );

      expect(dbQueryValidParams.getValidStringParams()).to.eql([]);
    });
  });
});
