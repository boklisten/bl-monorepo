import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import { ValidParameter } from "#services/query/db-query-valid-params";
import { SEDbQuery } from "#services/query/se.db-query";
import { SEDbQueryBuilder } from "#services/query/se.db-query-builder";

chaiUse(chaiAsPromised);
should();

test.group("DbQueryBuilder", async () => {
  const dbQueryBuilder = new SEDbQueryBuilder();

  test("should throw return empty SeDbQuery object if no query is given", async () => {
    expect(
      dbQueryBuilder.getDbQuery({}, [{ fieldName: "name", type: "string" }]),
    ).to.eql(new SEDbQuery());
  });

  test("should return SedbQuery with skip equal to 5", async () => {
    const result = new SEDbQuery();
    result.skipFilter = { skip: 5 };

    expect(dbQueryBuilder.getDbQuery({ skip: "5" }, [])).to.eql(result);
  });

  test("should return SeDbQuery with limit to 4", async () => {
    const result = new SEDbQuery();
    result.limitFilter = { limit: 4 };
    expect(dbQueryBuilder.getDbQuery({ limit: "4" }, [])).to.eql(result);
  });

  test("should return SeDbQuery with correct filters", async () => {
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

  test("should throw TypeError when limit is under 0", async () => {
    expect(() => {
      dbQueryBuilder.getDbQuery({ limit: "-6" }, []);
    }).to.throw(TypeError);
  });

  test("should throw TypeError when a number field is not a number", async () => {
    expect(() => {
      dbQueryBuilder.getDbQuery({ age: "albert" }, [
        { fieldName: "age", type: "number" },
      ]);
    }).to.Throw(TypeError);
  });

  test("should throw ReferenceError when a field is not in validQueryParams", async () => {
    expect(() => {
      dbQueryBuilder.getDbQuery({ og: ["name", "age"] }, [
        { fieldName: "age", type: "number" },
      ]);
    }).to.throw(ReferenceError);
  });
});
