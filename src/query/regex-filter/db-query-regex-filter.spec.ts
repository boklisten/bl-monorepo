import "mocha";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { DbQueryRegexFilter } from "@/query/regex-filter/db-query-regex-filter";

chai.use(chaiAsPromised);

describe("DbQueryRegexFilter", () => {
  const dbQueryRegexFilter: DbQueryRegexFilter = new DbQueryRegexFilter();

  describe("getRegexFilters()", () => {
    it("should return empty array when searchString is empty", () => {
      expect(dbQueryRegexFilter.getRegexFilters({ name: "hello" }, [])).to.eql(
        [],
      );
    });

    it("should throw TypeError when search fieldName is under 3 characters long", () => {
      expect(() => {
        dbQueryRegexFilter.getRegexFilters({ s: "si" }, ["name"]);
      }).to.throw(TypeError);
    });

    it("should return empty array when validSearchParams is empty", () => {
      expect(dbQueryRegexFilter.getRegexFilters({ s: "hello" }, [])).to.eql([]);
    });

    it('should return array like [{name: {$regex: "sig", $options: "imx"}}]', () => {
      const result = [
        { fieldName: "name", op: { $regex: "sig", $options: "imx" } },
      ];
      expect(dbQueryRegexFilter.getRegexFilters({ s: "sig" }, ["name"])).to.eql(
        result,
      );
    });

    it("should return array containing regexfilter objects for all params in validRegexParams", () => {
      const result = [
        { fieldName: "name", op: { $regex: "hello", $options: "imx" } },
        { fieldName: "message", op: { $regex: "hello", $options: "imx" } },
        { fieldName: "info", op: { $regex: "hello", $options: "imx" } },
        { fieldName: "desc", op: { $regex: "hello", $options: "imx" } },
      ];

      const validRegexParams = ["name", "message", "info", "desc"];
      const query = { s: "hello" };

      expect(
        dbQueryRegexFilter.getRegexFilters(query, validRegexParams),
      ).to.eql(result);
    });
  });
});
