import { Hook } from "#services/hook/hook";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { AccessToken } from "#shared/token/access-token";
import { UserDetail } from "#shared/user/user-detail/user-detail";

export class UserDetailUpdateHook extends Hook {
  private cleanUserInput = (dirtyText: string): string => {
    const withCoalescedSpaces = dirtyText.replaceAll(/\s+/gu, " ").trim();
    const separators = withCoalescedSpaces.match(/[ -]/g);
    const caseCorrectedWordParts = withCoalescedSpaces
      .split(/[ -]/g)

      // @ts-expect-error fixme: auto ignored
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
      branchMembership,
    } = body;
    if (emailConfirmed !== undefined && accessToken.permission === "customer") {
      throw new BlError(
        "bruker kan ikke endre egen e-post-bekreftet-status",
      ).code(911);
    }

    const databaseQuery = new SEDbQuery();
    databaseQuery.stringFilters = [{ fieldName: "phone", value: phone ?? "" }];
    let existingUsers = [];
    try {
      existingUsers = (
        await BlStorage.UserDetails.getByQuery(databaseQuery)
      ).filter((user) => user.id !== accessToken.details);
    } catch {
      // Not found
    }
    if (existingUsers.length > 0 && accessToken.permission === "customer") {
      throw new BlError(
        "telefonnummer er allerede registrert på en annen bruker",
      ).code(912);
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
      ...(branchMembership !== undefined && { branchMembership }),
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
    | "branchMembership"
  > & { dob: string } // DOB is otherwise Date
>;

const validateUserDetailUpdateType = (
  candidate: unknown,
): candidate is UserDetailPatch => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _typeofTypeHelper = typeof ("" as unknown);
  const isTypeOrUndefined = (
    key: keyof UserDetailPatch,
    typeName: typeof _typeofTypeHelper,
    // @ts-expect-error fixme: auto ignored
  ) => candidate[key] === undefined || typeof candidate[key] === typeName;

  try {
    const stringKeys = [
      "name",
      "address",
      "postCity",
      "dob",
      "postCode",
      "phone",
      "branchMembership",
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
