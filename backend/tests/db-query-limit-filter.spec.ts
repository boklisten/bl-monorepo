import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import { DbQueryLimitFilter } from "#services/legacy/query/db-query-limit-filter";

chaiUse(chaiAsPromised);
should();

test.group("DbQueryLimitFilter", async () => {
  const dbQueryLimitFilter = new DbQueryLimitFilter();

  test("should throw error if query is empty or null", async () => {
    expect(() => {
      dbQueryLimitFilter.getLimitFilter({});
    }).to.throw(TypeError);
  });

  test("should return {limit: 0} if no limit is found in query", async () => {
    expect(dbQueryLimitFilter.getLimitFilter({ name: "Albert" })).to.eql({
      limit: 0,
    });
  });

  test("should throw TypeError if limit is not a valid number", async () => {
    expect(() => {
      dbQueryLimitFilter.getLimitFilter({ limit: "not a number" });
    }).to.throw(TypeError);
  });
});
