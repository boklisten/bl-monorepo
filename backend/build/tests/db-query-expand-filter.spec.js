import { DbQueryExpandFilter } from "@backend/lib/query/db-query-expand-filter.js";
import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
chaiUse(chaiAsPromised);
should();
test.group("DbQueryExpandFilter", async () => {
    const dbQueryExpandFilter = new DbQueryExpandFilter();
    test("should throw TypeError if query is empty or null", async () => {
        expect(() => {
            dbQueryExpandFilter.getExpandFilters(null);
        }).to.throw(TypeError);
    });
    test('should return empty array if "expand" keyword is not found in query', async () => {
        expect(dbQueryExpandFilter.getExpandFilters({ og: "customer" })).to.eql([]);
    });
    test("should return array of expand field when present in query", async () => {
        expect(dbQueryExpandFilter.getExpandFilters({ expand: "customer" })).to.eql([{ fieldName: "customer" }]);
    });
    test("should return array of expand fields when present in query", async () => {
        expect(dbQueryExpandFilter.getExpandFilters({ expand: ["customer", "order"] })).to.eql([{ fieldName: "customer" }, { fieldName: "order" }]);
    });
});
