import { retrieveRefererPath } from "@backend/config/api-path.js";
import { APP_CONFIG } from "@backend/config/application-config.js";
import { test } from "@japa/runner";
import { expect, use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

test.group("Api Path - retrieveRefererPath", async () => {
  test("should return null if path does not include our basePath", async () => {
    expect(
      retrieveRefererPath({ referer: "https://www.m.facebook.com" }),
    ).to.be.eq(null);
  });

  test("should return null if path does not include our basePath", async () => {
    expect(retrieveRefererPath({ refferer: "https://google.com" })).to.be.eq(
      null,
    );
  });

  test("should return refererPath if url includes our basePath", async () => {
    APP_CONFIG.path.local.host = "boklisten";
    expect(
      retrieveRefererPath({
        referer: "https://www.boklisten.no/auth/login",
      }),
    ).to.be.eq("https://www.boklisten.no/");
  });

  test("should return refererPath if url includes our basePath", async () => {
    APP_CONFIG.path.local.host = "boklisten";
    expect(
      retrieveRefererPath({
        referer: "https://bladmin.boklisten.no/auth/login",
      }),
    ).to.be.eq("https://bladmin.boklisten.no/");
  });

  test("should return refererPath if url includes our basePath", async () => {
    APP_CONFIG.path.local.host = "boklisten";
    expect(
      retrieveRefererPath({
        referer: "https://api.boklisten.no/auth/login",
      }),
    ).to.be.eq("https://api.boklisten.no/");
  });

  test("should return refererPath if url includes our basePath", async () => {
    APP_CONFIG.path.local.host = "boklisten";
    expect(
      retrieveRefererPath({
        referer: "http://staging.boklisten.no/auth/login",
      }),
    ).to.be.eq("http://staging.boklisten.no/");
  });

  test("should return refererPath if url includes our basePath", async () => {
    APP_CONFIG.path.local.host = "boklisten";
    expect(
      retrieveRefererPath({
        referer: "http://staging.bladmin.boklisten.no/auth/login",
      }),
    ).to.be.eq("http://staging.bladmin.boklisten.no/");
  });

  test("should return refererPath if url includes our local basePath", async () => {
    APP_CONFIG.path.local.host = "localhost";
    expect(
      retrieveRefererPath({
        referer: "http://localhost:4200/auth/login",
      }),
    ).to.be.eq("http://localhost:4200/");
  });
});
