import { DbQueryDateFilter } from "@backend/lib/query/db-query-date-filter.js";
import { test } from "@japa/runner";
import { expect, should, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import moment from "moment";

chaiUse(chaiAsPromised);
should();

test.group("DbQueryDateFilter", async () => {
  const dbQueryDateFilter: DbQueryDateFilter = new DbQueryDateFilter();
  const validDateFormat = "DDMMYYYYHHmm";

  test("should throw TypeError if parameters are empty", async () => {
    expect(() => {
      dbQueryDateFilter.getDateFilters({}, []);
    }).to.throw(TypeError);
  });

  test("should return empty array if valid params is empty", async () => {
    expect(dbQueryDateFilter.getDateFilters({ something: "aas" }, [])).to.eql(
      [],
    );
  });

  test("should return empty array if query does not include any of the valid params", async () => {
    expect(
      dbQueryDateFilter.getDateFilters({ something: "" }, ["creationTime"]),
    ).to.eql([]);
  });

  test("should return filter with correct filedName", async () => {
    const fieldName = "creationDate";
    const query = { creationDate: "010120010000" };
    const momentDate = moment(
      query.creationDate,
      validDateFormat,
      true,
    ).toDate();

    expect(dbQueryDateFilter.getDateFilters(query, [fieldName])).to.eql([
      { fieldName: fieldName, op: { $eq: momentDate } },
    ]);
  });

  test(`should throw SyntaxError when date is ..."`)
    .with([
      "212121",
      "10notvalid",
      "kkk",
      "albert",
      "330120010000",
      "2101200300001",
    ])
    .run((ctx, date) => {
      const query = { creationTime: "" };
      query.creationTime = date;

      expect(() => {
        dbQueryDateFilter.getDateFilters(query, ["creationTime"]);
      }).to.throw(SyntaxError);
    });

  test("should resolve with correct date filter")
    .with([{ creationTime: "201220180000" }, { creationTime: "010720180000" }])
    .run((ctx, validQuery) => {
      const dateString = validQuery.creationTime;
      const isoDate = moment(dateString, validDateFormat, true).toDate();

      expect(
        dbQueryDateFilter.getDateFilters(validQuery, ["creationTime"]),
      ).to.eql([{ fieldName: "creationTime", op: { $eq: isoDate } }]);
    });

  test("should resolve with correct date filter")
    .with([
      { creationTime: "<201220180000", op: "$lt" },
      { creationTime: ">010720180000", op: "$gt" },
    ])
    .run((ctx, validQuery) => {
      const dateString = validQuery.creationTime.slice(
        1,
        validQuery.creationTime.length,
      );
      const isoDate = moment(dateString, validDateFormat, true).toDate();

      const expectedOp = {};

      // @ts-expect-error fixme: auto ignored
      expectedOp[validQuery.op] = isoDate;

      expect(
        dbQueryDateFilter.getDateFilters(validQuery, ["creationTime"]),
      ).to.eql([{ fieldName: "creationTime", op: expectedOp }]);
    });

  test("should resolve with correct date filter")
    .with([
      { creationTime: [">101020100000", "<171020100000"] },
      { creationTime: [">111220120000", "<121220130000"] },
      { creationTime: [">111220120000", "<101220150000"] },
    ])
    .run((ctx, validQuery) => {
      // @ts-expect-error fixme: auto ignored
      const gtDateString = validQuery.creationTime[0].slice(1);

      // @ts-expect-error fixme: auto ignored
      const ltDateString = validQuery.creationTime[1].slice(1);

      const gtIsoDate = moment(gtDateString, validDateFormat, true).toDate();
      const ltIsoDate = moment(ltDateString, validDateFormat, true).toDate();

      expect(
        dbQueryDateFilter.getDateFilters(validQuery, ["creationTime"]),
      ).to.eql([
        {
          fieldName: "creationTime",
          op: { $gt: gtIsoDate, $lt: ltIsoDate },
        },
      ]);
    });
});
