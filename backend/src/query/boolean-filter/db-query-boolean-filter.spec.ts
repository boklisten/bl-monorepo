import "mocha";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { DbQueryBooleanFilter } from "@/query/boolean-filter/db-query-boolean-filter";

chai.use(chaiAsPromised);

describe("DbQueryBooleanFilter", () => {
  describe("getBooleanFilters", () => {
    const dbQueryBooleanFilter: DbQueryBooleanFilter =
      new DbQueryBooleanFilter();

    it("should throw TypeError if query is empty or null", () => {
      expect(() => {
        dbQueryBooleanFilter.getBooleanFilters(null, ["hello"]);
      }).to.throw(TypeError);
    });

    it("should return empty filter if ValidBoomeanParams array is empty", () => {
      expect(
        dbQueryBooleanFilter.getBooleanFilters({ name: "albert" }, []),
      ).to.eql([]);
    });

    it('should return array of [{fieldName: "haveEaten", value: true"}]', () => {
      const result = [{ fieldName: "haveEaten", value: true }];
      expect(
        dbQueryBooleanFilter.getBooleanFilters({ haveEaten: "true" }, [
          "haveEaten",
        ]),
      ).to.eql(result);
    });

    it("should throw TypeError if a value that is can not be parsed to boolean is given", () => {
      expect(() => {
        dbQueryBooleanFilter.getBooleanFilters({ haveEaten: "hello" }, [
          "haveEaten",
        ]);
      }).to.throw(TypeError);
    });

    it("should return array that includes all params that are of boolean type in query", () => {
      const result = [
        { fieldName: "confirmed", value: true },
        { fieldName: "hasCar", value: false },
        { fieldName: "isOld", value: true },
      ];

      expect(
        dbQueryBooleanFilter.getBooleanFilters(
          { confirmed: "true", hasCar: "false", isOld: "true" },
          ["confirmed", "hasCar", "isOld", "haveChildren"],
        ),
      ).to.eql(result);
    });
  });
});
