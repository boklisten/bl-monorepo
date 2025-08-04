import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import { DbQueryBooleanFilter } from "#services/legacy/query/db-query-boolean-filter";

chaiUse(chaiAsPromised);
should();

test.group("DbQueryBooleanFilter", async () => {
  const dbQueryBooleanFilter: DbQueryBooleanFilter = new DbQueryBooleanFilter();

  test("should throw TypeError if query is empty or null", async () => {
    expect(() => {
      dbQueryBooleanFilter.getBooleanFilters({}, ["hello"]);
    }).to.throw(TypeError);
  });

  test("should return empty filter if ValidBoomeanParams array is empty", async () => {
    expect(
      dbQueryBooleanFilter.getBooleanFilters({ name: "albert" }, []),
    ).to.eql([]);
  });

  test('should return array of [{fieldName: "haveEaten", value: true"}]', async () => {
    const result = [{ fieldName: "haveEaten", value: true }];
    expect(
      dbQueryBooleanFilter.getBooleanFilters({ haveEaten: "true" }, [
        "haveEaten",
      ]),
    ).to.eql(result);
  });

  test("should throw TypeError if a value that is can not be parsed to boolean is given", async () => {
    expect(() => {
      dbQueryBooleanFilter.getBooleanFilters({ haveEaten: "hello" }, [
        "haveEaten",
      ]);
    }).to.throw(TypeError);
  });

  test("should return array that includes all params that are of boolean type in query", async () => {
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
