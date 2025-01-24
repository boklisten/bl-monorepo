import { DbQueryStringFilter } from "@backend/lib/query/db-query-string-filter.js";
import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
chaiUse(chaiAsPromised);
should();
test.group("DbQueryStringFilter", async () => {
    const dbQueryStringFilter = new DbQueryStringFilter();
    test("should return empty array if query is valid and validStringParams is empty", async () => {
        expect(dbQueryStringFilter.getStringFilters({ name: "testerman" }, [])).to.eql([]);
    });
    test("should throw TypeError if query is empty", async () => {
        expect(() => {
            dbQueryStringFilter.getStringFilters({}, ["name"]);
        }).to.throw(TypeError);
    });
    test("should throw error when both query and validParams are empty ", async () => {
        expect(() => {
            dbQueryStringFilter.getStringFilters({}, []);
        }).to.throw(TypeError);
    });
    test("should throw TypeError if parameter is not a valid string", async () => {
        expect(() => {
            dbQueryStringFilter.getStringFilters({ name: { test: {} } }, ["name"]);
        }).to.throw(TypeError);
    });
    test("should not change values in query that are not in ValidStringParams", async () => {
        const result = [{ fieldName: "name", value: "albert" }];
        expect(dbQueryStringFilter.getStringFilters({ name: "albert", phone: "123" }, [
            "name",
        ])).to.eql(result);
    });
    test("should return correct array given valid input", async () => {
        const query = {
            name: "billy bob",
            desc: "hello there this is bob",
            age: "10",
            branch: ["123", "83ax"],
        };
        const result = [
            { fieldName: "name", value: "billy bob" },
            { fieldName: "desc", value: "hello there this is bob" },
            { fieldName: "branch", value: ["123", "83ax"] },
        ];
        expect(dbQueryStringFilter.getStringFilters(query, [
            "name",
            "desc",
            "title",
            "branch",
        ])).to.eql(result);
    });
});
