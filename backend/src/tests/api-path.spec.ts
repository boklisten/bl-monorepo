import "mocha";
import { retrieveRefererPath } from "@backend/config/api-path.js";
import { APP_CONFIG } from "@backend/config/application-config.js";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("Api Path", () => {
  describe("#retrieveRefererPath", () => {
    it("should return null if path does not include our basePath", () => {
      return expect(
        retrieveRefererPath({ referer: "https://www.m.facebook.com" }),
      ).to.be.eq(null);
    });

    it("should return null if path does not include our basePath", () => {
      return expect(
        retrieveRefererPath({ refferer: "https://google.com" }),
      ).to.be.eq(null);
    });

    it("should return refererPath if url includes our basePath", () => {
      APP_CONFIG.path.local.host = "boklisten";
      return expect(
        retrieveRefererPath({
          referer: "https://www.boklisten.no/auth/login",
        }),
      ).to.be.eq("https://www.boklisten.no/");
    });

    it("should return refererPath if url includes our basePath", () => {
      APP_CONFIG.path.local.host = "boklisten";
      return expect(
        retrieveRefererPath({
          referer: "https://bladmin.boklisten.no/auth/login",
        }),
      ).to.be.eq("https://bladmin.boklisten.no/");
    });

    it("should return refererPath if url includes our basePath", () => {
      APP_CONFIG.path.local.host = "boklisten";
      return expect(
        retrieveRefererPath({
          referer: "https://api.boklisten.no/auth/login",
        }),
      ).to.be.eq("https://api.boklisten.no/");
    });

    it("should return refererPath if url includes our basePath", () => {
      APP_CONFIG.path.local.host = "boklisten";
      return expect(
        retrieveRefererPath({
          referer: "http://staging.boklisten.no/auth/login",
        }),
      ).to.be.eq("http://staging.boklisten.no/");
    });

    it("should return refererPath if url includes our basePath", () => {
      APP_CONFIG.path.local.host = "boklisten";
      return expect(
        retrieveRefererPath({
          referer: "http://staging.bladmin.boklisten.no/auth/login",
        }),
      ).to.be.eq("http://staging.bladmin.boklisten.no/");
    });

    it("should return refererPath if url includes our local basePath", () => {
      APP_CONFIG.path.local.host = "localhost";
      return expect(
        retrieveRefererPath({
          referer: "http://localhost:4200/auth/login",
        }),
      ).to.be.eq("http://localhost:4200/");
    });
  });
});
