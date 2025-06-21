import { test } from "@japa/runner";

import { retrieveRefererPath } from "#services/config/api-path";
import { APP_CONFIG } from "#services/config/application-config";

test.group("Api Path - retrieveRefererPath", async () => {
  test("should return null if path does not include our basePath", async ({
    assert,
  }) => {
    assert.equal(
      retrieveRefererPath({ referer: "https://www.m.facebook.com" }),
      null,
    );
  });

  test("should return null if path does not include our basePath", async ({
    assert,
  }) => {
    assert.equal(retrieveRefererPath({ refferer: "https://google.com" }), null);
  });

  test("should return refererPath if url includes our basePath", async ({
    assert,
  }) => {
    APP_CONFIG.path.local.host = "boklisten";
    assert.equal(
      retrieveRefererPath({
        referer: "https://www.boklisten.no/auth/login",
      }),
      "https://www.boklisten.no/",
    );
  });

  test("should return refererPath if url includes our basePath", async ({
    assert,
  }) => {
    APP_CONFIG.path.local.host = "boklisten";
    assert.equal(
      retrieveRefererPath({
        referer: "https://bladmin.boklisten.no/auth/login",
      }),
      "https://bladmin.boklisten.no/",
    );
  });

  test("should return refererPath if url includes our basePath", async ({
    assert,
  }) => {
    APP_CONFIG.path.local.host = "boklisten";
    assert.equal(
      retrieveRefererPath({
        referer: "https://api.boklisten.no/auth/login",
      }),
      "https://api.boklisten.no/",
    );
  });

  test("should return refererPath if url includes our basePath", async ({
    assert,
  }) => {
    APP_CONFIG.path.local.host = "boklisten";
    assert.equal(
      retrieveRefererPath({
        referer: "http://staging.boklisten.no/auth/login",
      }),
      "http://staging.boklisten.no/",
    );
  });

  test("should return refererPath if url includes our basePath", async ({
    assert,
  }) => {
    APP_CONFIG.path.local.host = "boklisten";
    assert.equal(
      retrieveRefererPath({
        referer: "http://staging.bladmin.boklisten.no/auth/login",
      }),
      "http://staging.bladmin.boklisten.no/",
    );
  });

  test("should return refererPath if url includes our local basePath", async ({
    assert,
  }) => {
    APP_CONFIG.path.local.host = "localhost";
    assert.equal(
      retrieveRefererPath({
        referer: "http://localhost:4200/auth/login",
      }),
      "http://localhost:4200/",
    );
  });
});
