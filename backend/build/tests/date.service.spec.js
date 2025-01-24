import { DateService } from "@backend/lib/blc/date.service.js";
import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import moment from "moment-timezone";
chaiUse(chaiAsPromised);
should();
test.group("DateService", async () => {
    test("should return with date on correct localtime", async () => {
        const utcDate = new Date(Date.UTC(2019, 11, 20));
        const expectedDateString = "2019-12-20T01:00:00.000+01:00";
        expect(DateService.utcToLocalTimeString(utcDate, "Europe/Oslo")).equal(expectedDateString);
    });
    test("should convert datestring to correct localtime", async () => {
        const datestring = "2019-12-19T23:00:00.000+00:00";
        const expectedDateString = "2019-12-20T00:00:00.000+01:00";
        expect(DateService.utcToLocalTimeString(datestring, "Europe/Oslo")).equal(expectedDateString);
    });
    test("should convert datestring to correct localtime", async () => {
        // IT IS SUMMERTIME IN NORWAY... + 02:00
        const datestring = "2020-06-30T22:00:00.000+00:00";
        const expectedDateString = "2020-07-01T00:00:00.000+02:00";
        expect(DateService.utcToLocalTimeString(datestring, "Europe/Oslo")).equal(expectedDateString);
    });
    test("should be possible to display returned string on local format", async () => {
        const utcDate = new Date(Date.UTC(2019, 11, 20));
        expect(DateService.toPrintFormat(DateService.utcToLocalTimeString(utcDate, "Europe/Oslo"), "Europe/Oslo")).equal("20.12.19");
    });
    test("should be possible to display returned string on correct local format", async () => {
        const utcDate = "2019-12-20T00:00:00.000+01:00";
        expect(DateService.toPrintFormat(DateService.utcToLocalTimeString(utcDate, "Europe/Oslo"), "Europe/Oslo")).equal("20.12.19");
    });
    test("should be possible to convert from timezone America/Los_Angeles to Europe/Oslo", async () => {
        const utcDate = new Date(Date.UTC(2018, 11, 20));
        const americaDate = DateService.utcToLocalTimeString(utcDate, "America/Los_Angeles");
        expect(DateService.utcToLocalTimeString(americaDate, "Europe/Oslo")).equal("2018-12-20T01:00:00.000+01:00");
    });
    test("should convert to local time", async () => {
        expect(DateService.utcToLocalTimeString("2018-12-20T00:00:00.000+00:00", "Europe/Oslo")).equal("2018-12-20T01:00:00.000+01:00");
    });
    test("should convert to correct local time", async () => {
        expect(DateService.utcToLocalTimeString("2018-12-19T23:00:00.000+00:00", "Europe/Oslo")).equal("2018-12-20T00:00:00.000+01:00");
    });
    test("should return date on correct format", async () => {
        const date = "2019-12-20T22:00:00.000+01:00";
        expect(DateService.toPrintFormat(date, "Europe/Oslo")).equal("20.12.19");
    });
    test("should return a time with added 23:59 hours", async () => {
        const date = "2020-06-30T22:00:00.000+00:00";
        expect(DateService.toEndOfDay(date, "Europe/Oslo").toISOString()).equal("2020-07-01T21:59:59.999Z");
    });
    test("should return date on correct format", async () => {
        const date = "2020-01-01T10:12:20.000+01:00";
        expect(DateService.format(date, "Europe/Oslo", "DD.MM.YYYY HH:mm:ss")).equal("01.01.2020 10:12:20");
    });
    test("should return true if date is between from date and to date", async () => {
        const date = new Date(1900, 1, 10, 10, 12, 13);
        const from = new Date(1900, 1, 10, 9);
        const to = new Date(1900, 1, 10, 20);
        expect(DateService.between(date, from, to, "Europe/Oslo")).to.be.true;
    });
    test("should return false if birthday is under 18", async () => {
        const birthdays = [
            moment().subtract(1, "day").toDate(),
            moment().subtract(1, "year").toDate(),
            moment().subtract(17, "years").toDate(),
            moment().subtract(18, "years").add(1, "day").toDate(),
            moment().toDate(),
        ];
        for (const birthday of birthdays) {
            expect(DateService.isOver18(birthday)).to.be.false;
        }
    });
    test("should return true if birthday is over 18", async () => {
        const birthdays = [
            moment().subtract(98, "years").toDate(),
            moment().subtract(19, "year").toDate(),
            moment().subtract(21, "years").toDate(),
            moment().subtract(18, "years").toDate(),
        ];
        for (const birthday of birthdays) {
            expect(DateService.isOver18(birthday)).to.be.true;
        }
    });
    test("should return true if date is between from hour and to hour", async () => {
        const date = moment()
            .tz("Europe/Oslo")
            .hour(12)
            .minute(15)
            .seconds(22)
            .toDate();
        expect(DateService.betweenHours(date, 8, 18, "Europe/Oslo")).to.be.true;
    });
    test("should return false if date is not between from hour and to hour", async () => {
        const date = moment()
            .tz("Europe/Oslo")
            .hour(7)
            .minute(15)
            .seconds(22)
            .toDate();
        expect(DateService.betweenHours(date, 8, 18, "Europe/Oslo")).to.be.false;
    });
});
