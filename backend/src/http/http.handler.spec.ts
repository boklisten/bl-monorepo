import "mocha";
import { HttpHandler } from "@backend/http/http.handler";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);
should();

describe("HttpHandler", () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const httpHandler = new HttpHandler();

  // AUTO IGNORED:
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  describe("#getWithQuery()", () => {});
});
