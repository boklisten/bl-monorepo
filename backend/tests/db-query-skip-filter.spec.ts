import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

import { DbQuerySkipFilter } from "#services/query/db-query-skip-filter";

chaiUse(chaiAsPromised);
should();

test.group("DbQuerySkipFilter", async () => {
  const dbQuerySkipFilter: DbQuerySkipFilter = new DbQuerySkipFilter();

  test("should throw TypeError if query is null or empty", async () => {
    expect(() => {
      dbQuerySkipFilter.getSkipFilter({});
    }).to.throw(TypeError);
  });

  test("should return {skip: 0} when no skip parameter is in query", async () => {
    expect(dbQuerySkipFilter.getSkipFilter({ name: "hello" })).to.eql({
      skip: 0,
    });
  });

  test("should throw TypeError when skip is not a number", async () => {
    expect(() => {
      dbQuerySkipFilter.getSkipFilter({ skip: "hello" });
    }).to.throw(TypeError);
  });

  test("should throw TypeError if number is below 0", async () => {
    expect(() => {
      dbQuerySkipFilter.getSkipFilter({ skip: "-1" });
    }).to.throw(TypeError);
  });

  test('should return skip 5 when query is {skip: "5"}', async () => {
    expect(dbQuerySkipFilter.getSkipFilter({ skip: "5" })).to.eql({
      skip: 5,
    });
  });
});
