import { BlError } from "@boklisten/bl-model";

import { isNullish } from "@/helper/typescript-helpers";
export class OrderHookBefore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(requestJsonBody: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (
        Object.prototype.toString.call(requestJsonBody) === "[object Array]"
      ) {
        return reject(
          new BlError("request is an array but should be a object")
            .store("requestBody", requestJsonBody)
            .code(701),
        );
      }

      try {
        this.checkMinimumRequiredFields(requestJsonBody);
      } catch (e) {
        if (e instanceof BlError) {
          reject(new BlError("the request body is not valid").add(e).code(701));
        }
        reject(
          new BlError("unkown error, request body is not valid")
            .store("error", e)
            .code(701),
        );
      }

      resolve(true);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private checkMinimumRequiredFields(requestBody: any): boolean {
    if (isNullish(requestBody["amount"])) {
      throw new BlError("required field amount in order is not specified");
    }

    if (!requestBody["orderItems"]) {
      throw new BlError("required field orderItems in order is not specified");
    }

    return true;
  }
}
