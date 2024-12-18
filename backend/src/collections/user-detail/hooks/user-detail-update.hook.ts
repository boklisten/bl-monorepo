import { Hook } from "@backend/hook/hook";
import { BlError } from "@shared/bl-error/bl-error";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class UserDetailUpdateHook extends Hook {
  private cleanUserInput = (dirtyText: string): string => {
    const withCoalescedSpaces = dirtyText.replaceAll(/\s+/gu, " ").trim();
    const separators = withCoalescedSpaces.match(/[ -]/g);
    const caseCorrectedWordParts = withCoalescedSpaces
      .split(/[ -]/g)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
    return caseCorrectedWordParts
      .map((part, index) => part + (separators?.[index] ?? ""))
      .join("");
  };

  private cleanGuardianInfo(
    guardian: UserDetail["guardian"],
  ): UserDetail["guardian"] {
    return (
      guardian && {
        ...guardian,
        name: this.cleanUserInput(guardian.name),
        email: guardian.email.toLowerCase(),
      }
    );
  }

  public override async before(
    body: unknown,
    accessToken: AccessToken,
  ): Promise<UserDetailPatch> {
    if (!validateUserDetailUpdateType(body)) {
      throw new BlError("Invalid UserDetailUpdateType request body").code(701);
    }
    const {
      name,
      address,
      postCity,
      dob,
      postCode,
      phone,
      emailConfirmed,
      guardian,
    } = body;
    if (emailConfirmed !== undefined && accessToken.permission === "customer") {
      throw new BlError(
        "bruker kan ikke endre egen e-post-bekreftet-status",
      ).code(911);
    }

    // In an update call, a value of 'undefined' will remove a key, so the key
    // needs to be completely missing if it shouldn't be updated.
    return {
      ...(name !== undefined && { name: this.cleanUserInput(name) }),
      ...(address !== undefined && { address: this.cleanUserInput(address) }),
      ...(postCity !== undefined && {
        postCity: this.cleanUserInput(postCity),
      }),
      ...(dob !== undefined && { dob }),
      ...(postCode !== undefined && { postCode }),
      ...(phone !== undefined && { phone }),
      ...(emailConfirmed !== undefined && { emailConfirmed }),
      ...(guardian?.name &&
        guardian?.email && {
          guardian: this.cleanGuardianInfo(guardian) ?? guardian,
        }),
    };
  }
}

export type UserDetailPatch = Partial<
  Pick<
    UserDetail,
    | "name"
    | "address"
    | "postCity"
    | "postCode"
    | "phone"
    | "emailConfirmed"
    | "guardian"
  > & { dob: string } // DOB is otherwise Date
>;

const validateUserDetailUpdateType = (
  candidate: unknown,
): candidate is UserDetailPatch => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _typeofTypeHelper = typeof ("" as unknown);
  const isTypeOrUndefined = (
    key: keyof UserDetailPatch,
    typeName: typeof _typeofTypeHelper, // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  ) => candidate[key] === undefined || typeof candidate[key] === typeName;

  try {
    const stringKeys = [
      "name",
      "address",
      "postCity",
      "dob",
      "postCode",
      "phone",
    ] as const;
    return (
      stringKeys.every((key) => isTypeOrUndefined(key, "string")) &&
      isTypeOrUndefined("emailConfirmed", "boolean") &&
      isTypeOrUndefined("guardian", "object")
    );
  } catch {
    return false;
  }
};
