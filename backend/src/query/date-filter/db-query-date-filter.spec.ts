import "mocha";
import { DbQueryDateFilter } from "@backend/query/date-filter/db-query-date-filter";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import moment from "moment";

chai.use(chaiAsPromised);

describe("DbQueryDateFilter", () => {
  const dbQueryDateFilter: DbQueryDateFilter = new DbQueryDateFilter();
  const validDateFormat = "DDMMYYYYHHmm";

  describe("#getDateFilters", () => {
    it("should throw TypeError if parameters are empty", () => {
      expect(() => {
        dbQueryDateFilter.getDateFilters({}, []);
      }).to.throw(TypeError);
    });

    it("should return empty array if valid params is empty", () => {
      return expect(
        dbQueryDateFilter.getDateFilters({ something: "aas" }, []),
      ).to.eql([]);
    });

    it("should return empty array if query does not include any of the valid params", () => {
      return expect(
        dbQueryDateFilter.getDateFilters({ something: "" }, ["creationTime"]),
      ).to.eql([]);
    });

    it("should return filter with correct filedName", () => {
      const fieldName = "creationDate";
      const query = { creationDate: "010120010000" };
      const momentDate = moment(
        query.creationDate,
        validDateFormat,
        true,
      ).toDate();

      return expect(
        dbQueryDateFilter.getDateFilters(query, [fieldName]),
      ).to.eql([{ fieldName: fieldName, op: { $eq: momentDate } }]);
    });

    context("when date is on invalid format", () => {
      const validDateParams = ["creationTime"];
      const query = { creationTime: "" };

      const invalidDates = [
        "212121",
        "10notvalid",
        "kkk",
        "albert",
        "330120010000",
        "2101200300001",
      ];

      for (const invalidDate of invalidDates) {
        it(`should throw SyntaxError when date is "${invalidDate}"`, () => {
          query.creationTime = invalidDate;

          expect(() => {
            dbQueryDateFilter.getDateFilters(query, validDateParams);
          }).to.throw(SyntaxError);
        });
      }
    });

    context("when only one date is provided without operation", () => {
      const validDateParams = ["creationTime"];
      const validQueries = [
        { creationTime: "201220180000" },
        { creationTime: "010720180000" },
      ];

      for (const validQuery of validQueries) {
        it("should resolve with correct date filter", () => {
          const dateString = validQuery.creationTime;
          const isoDate = moment(dateString, validDateFormat, true).toDate();

          return expect(
            dbQueryDateFilter.getDateFilters(validQuery, validDateParams),
          ).to.eql([{ fieldName: "creationTime", op: { $eq: isoDate } }]);
        });
      }
    });

    context("when only one date is provided with operation", () => {
      const validDateParams = ["creationTime"];
      const validQueries = [
        { creationTime: "<201220180000", op: "$lt" },
        { creationTime: ">010720180000", op: "$gt" },
      ];

      for (const validQuery of validQueries) {
        it("should resolve with correct date filter", () => {
          const creationTime = validQuery.creationTime.slice(
            1,
            validQuery.creationTime.length,
          );
          const dateString = creationTime;
          const isoDate = moment(dateString, validDateFormat, true).toDate();

          const expectedOp = {};
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          expectedOp[validQuery.op] = isoDate;

          return expect(
            dbQueryDateFilter.getDateFilters(validQuery, validDateParams),
          ).to.eql([{ fieldName: "creationTime", op: expectedOp }]);
        });
      }
    });

    context("when valid $lt and $gt on a param is provided", () => {
      const validDateParams = ["creationTime"];

      const validQueries = [
        { creationTime: [">101020100000", "<171020100000"] },
        { creationTime: [">111220120000", "<121220130000"] },
        { creationTime: [">111220120000", "<101220150000"] },
      ];

      for (const validQuery of validQueries) {
        it("should resolve with correct date filter", () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const gtDateString = validQuery.creationTime[0].slice(1);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const ltDateString = validQuery.creationTime[1].slice(1);

          const gtIsoDate = moment(
            gtDateString,
            validDateFormat,
            true,
          ).toDate();
          const ltIsoDate = moment(
            ltDateString,
            validDateFormat,
            true,
          ).toDate();

          return expect(
            dbQueryDateFilter.getDateFilters(validQuery, validDateParams),
          ).to.eql([
            {
              fieldName: "creationTime",
              op: { $gt: gtIsoDate, $lt: ltIsoDate },
            },
          ]);
        });
      }
    });
  });
});
