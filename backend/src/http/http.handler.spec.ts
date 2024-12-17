import "mocha";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { HttpHandler } from "@/http/http.handler";

chai.use(chaiAsPromised);

describe("HttpHandler", () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const httpHandler = new HttpHandler();

  // AUTO IGNORED:
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  describe("#getWithQuery()", () => {});
});
