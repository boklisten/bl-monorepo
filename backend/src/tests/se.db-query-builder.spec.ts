import { ValidParameter } from "@backend/query/db-query-valid-params.js";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder.js";
import { SEDbQuery } from "@backend/query/se.db-query.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("DbQueryBuilder", () => {
  describe("getDbQuery()", () => {
    const dbQueryBuilder = new SEDbQueryBuilder();

    it("should throw return empty SeDbQuery object if no query is given", () => {
      expect(
        dbQueryBuilder.getDbQuery({}, [{ fieldName: "name", type: "string" }]),
      ).to.eql(new SEDbQuery());
    });

    it("should return SedbQuery with skip equal to 5", () => {
      const result = new SEDbQuery();
      result.skipFilter = { skip: 5 };

      expect(dbQueryBuilder.getDbQuery({ skip: "5" }, [])).to.eql(result);
    });

    it("should return SeDbQuery with limit to 4", () => {
      const result = new SEDbQuery();
      result.limitFilter = { limit: 4 };
      expect(dbQueryBuilder.getDbQuery({ limit: "4" }, [])).to.eql(result);
    });

    it("should return SeDbQuery with correct filters", () => {
      const result = new SEDbQuery();
      result.numberFilters = [
        { fieldName: "age", op: { $gt: 12, $lt: 60 } },
        { fieldName: "price", op: { $eq: 120 } },
      ];

      result.limitFilter = { limit: 3 };
      result.onlyGetFilters = [{ fieldName: "name", value: 1 }];

      const validParams: ValidParameter[] = [
        { fieldName: "name", type: "string" },
        { fieldName: "age", type: "number" },
        { fieldName: "price", type: "number" },
      ];

      expect(
        dbQueryBuilder.getDbQuery(
          { age: [">12", "<60"], price: "120", limit: "3", og: "name" },
          validParams,
        ),
      ).to.eql(result);
    });

    describe("getDbQuery() should throw type error", () => {
      it("should throw TypeError when limit is under 0", () => {
        expect(() => {
          dbQueryBuilder.getDbQuery({ limit: "-6" }, []);
        }).to.throw(TypeError);
      });

      it("should throw TypeError when a number field is not a number", () => {
        expect(() => {
          dbQueryBuilder.getDbQuery({ age: "albert" }, [
            { fieldName: "age", type: "number" },
          ]);
        }).to.Throw(TypeError);
      });
    });

    describe("getDbQuery() should throw ReferenceError", () => {
      it("should throw ReferenceError when a field is not in validQueryParams", () => {
        expect(() => {
          dbQueryBuilder.getDbQuery({ og: ["name", "age"] }, [
            { fieldName: "age", type: "number" },
          ]);
        }).to.throw(ReferenceError);
      });
    });
  });
});
