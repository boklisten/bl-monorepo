import "mocha";
import { JwtPayload, SEToken } from "@backend/auth/token/se.token";
import { BlError } from "@shared/bl-error/bl-error";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("SeToken", () => {
  describe("createToken()", () => {
    const seToken: SEToken = new SEToken();

    it("should reject BlError when username is empty", () => {
      return seToken
        .createToken("", "admin", "something")
        .should.be.rejectedWith(BlError);
    });

    it("should reject BlError when blid is empty", () => {
      return seToken
        .createToken("hello", "admin", "")
        .should.be.rejectedWith(BlError);
    });
  });

  describe("validateToken()", () => {
    const seToken: SEToken = new SEToken();

    it("should reject with BlError if token is empty", () => {
      return seToken
        .validateToken("", { permissions: ["admin"] })
        .should.be.rejectedWith(BlError);
    });

    it("should decode so the username is the same as when signed", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return new Promise((resolve, reject) => {
        seToken.createToken("albert", "admin", "1").then(
          (token: string) => {
            seToken.validateToken(token, { permissions: ["admin"] }).then(
              (decodedToken: JwtPayload) => {
                resolve(decodedToken.username);
              },
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              (error) => {
                //no need
              },
            );
          },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (error) => {
            //no need for error handling in a test for resolve
          },
        );
      }).should.eventually.be.equal("albert");
    });

    it("should reject if the token lacks permission", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return new Promise((resolve, reject) => {
        seToken.createToken("albert", "customer", "1").then(
          (token: string) => {
            seToken
              .validateToken(token, {
                permissions: ["admin"],
              })
              .then(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                (decodedToken: JwtPayload) => {},
                (error: any) => {
                  reject(new Error(error));
                },
              );
          },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (error: any) => {},
        );
      }).should.be.rejectedWith(Error);
    });
  });
});
