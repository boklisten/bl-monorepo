import { dateService } from "@backend/blc/date.service";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import moment from "moment-timezone";

chai.use(chaiAsPromised);

describe("DateService", () => {
  describe("toLocalTime", () => {
    it("should return with date on correct localtime", () => {
      const utcDate = new Date(Date.UTC(2019, 11, 20));
      const expectedDateString = "2019-12-20T01:00:00.000+01:00";

      return expect(
        dateService.utcToLocalTimeString(utcDate, "Europe/Oslo"),
      ).equal(expectedDateString);
    });

    it("should convert datestring to correct localtime", () => {
      const datestring = "2019-12-19T23:00:00.000+00:00";
      const expectedDateString = "2019-12-20T00:00:00.000+01:00";

      return expect(
        dateService.utcToLocalTimeString(datestring, "Europe/Oslo"),
      ).equal(expectedDateString);
    });

    it("should convert datestring to correct localtime", () => {
      // IT IS SUMMERTIME IN NORWAY... + 02:00
      const datestring = "2020-06-30T22:00:00.000+00:00";
      const expectedDateString = "2020-07-01T00:00:00.000+02:00";

      return expect(
        dateService.utcToLocalTimeString(datestring, "Europe/Oslo"),
      ).equal(expectedDateString);
    });

    it("should be possible to display returned string on local format", () => {
      const utcDate = new Date(Date.UTC(2019, 11, 20));

      return expect(
        dateService.toPrintFormat(
          dateService.utcToLocalTimeString(utcDate, "Europe/Oslo"),
          "Europe/Oslo",
        ),
      ).equal("20.12.19");
    });

    it("should be possible to display returned string on correct local format", () => {
      const utcDate = "2019-12-20T00:00:00.000+01:00";

      return expect(
        dateService.toPrintFormat(
          dateService.utcToLocalTimeString(utcDate, "Europe/Oslo"),
          "Europe/Oslo",
        ),
      ).equal("20.12.19");
    });

    it("should be possible to convert from timezone America/Los_Angeles to Europe/Oslo", () => {
      const utcDate = new Date(Date.UTC(2018, 11, 20));

      const americaDate = dateService.utcToLocalTimeString(
        utcDate,
        "America/Los_Angeles",
      );

      return expect(
        dateService.utcToLocalTimeString(americaDate, "Europe/Oslo"),
      ).equal("2018-12-20T01:00:00.000+01:00");
    });

    it("should convert to local time", () => {
      return expect(
        dateService.utcToLocalTimeString(
          "2018-12-20T00:00:00.000+00:00",
          "Europe/Oslo",
        ),
      ).equal("2018-12-20T01:00:00.000+01:00");
    });

    it("should convert to correct local time", () => {
      return expect(
        dateService.utcToLocalTimeString(
          "2018-12-19T23:00:00.000+00:00",
          "Europe/Oslo",
        ),
      ).equal("2018-12-20T00:00:00.000+01:00");
    });
  });

  describe("toPrintFormat", () => {
    it("should return date on correct format", () => {
      const date = "2019-12-20T22:00:00.000+01:00";
      return expect(dateService.toPrintFormat(date, "Europe/Oslo")).equal(
        "20.12.19",
      );
    });
  });

  describe("toEndOfDay()", () => {
    it("should return a time with added 23:59 hours", () => {
      const date = "2020-06-30T22:00:00.000+00:00";
      return expect(
        dateService.toEndOfDay(date, "Europe/Oslo").toISOString(),
      ).equal("2020-07-01T21:59:59.999Z");
    });
  });

  describe("format()", () => {
    it("should return date on correct format", () => {
      const date = "2020-01-01T10:12:20.000+01:00";
      return expect(
        dateService.format(date, "Europe/Oslo", "DD.MM.YYYY HH:mm:ss"),
      ).equal("01.01.2020 10:12:20");
    });
  });

  describe("between()", () => {
    it("should return true if date is between from date and to date", () => {
      const date = new Date(1900, 1, 10, 10, 12, 13);
      const from = new Date(1900, 1, 10, 9);
      const to = new Date(1900, 1, 10, 20);

      return expect(dateService.between(date, from, to, "Europe/Oslo")).to.be
        .true;
    });
  });

  describe("isOver18()", () => {
    it("should return false if birthday is under 18", () => {
      const birthdays = [
        moment().subtract(1, "day").toDate(),
        moment().subtract(1, "year").toDate(),
        moment().subtract(17, "years").toDate(),
        moment().subtract(18, "years").add(1, "day").toDate(),
        moment().toDate(),
      ];

      for (const birthday of birthdays) {
        expect(dateService.isOver18(birthday)).to.be.false;
      }
    });

    it("should return true if birthday is over 18", () => {
      const birthdays = [
        moment().subtract(98, "years").toDate(),
        moment().subtract(19, "year").toDate(),
        moment().subtract(21, "years").toDate(),
        moment().subtract(18, "years").toDate(),
      ];

      for (const birthday of birthdays) {
        expect(dateService.isOver18(birthday)).to.be.true;
      }
    });
  });

  describe("betweenHours()", () => {
    it("should return true if date is between from hour and to hour", () => {
      const date = moment()
        .tz("Europe/Oslo")
        .hour(12)
        .minute(15)
        .seconds(22)
        .toDate();

      return expect(dateService.betweenHours(date, 8, 18, "Europe/Oslo")).to.be
        .true;
    });

    it("should return false if date is not between from hour and to hour", () => {
      const date = moment()
        .tz("Europe/Oslo")
        .hour(7)
        .minute(15)
        .seconds(22)
        .toDate();

      return expect(dateService.betweenHours(date, 8, 18, "Europe/Oslo")).to.be
        .false;
    });
  });
});
