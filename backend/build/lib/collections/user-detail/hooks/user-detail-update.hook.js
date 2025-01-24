import { Hook } from "@backend/lib/hook/hook.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class UserDetailUpdateHook extends Hook {
    cleanUserInput = (dirtyText) => {
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
    cleanGuardianInfo(guardian) {
        return (guardian && {
            ...guardian,
            name: this.cleanUserInput(guardian.name),
            email: guardian.email.toLowerCase(),
        });
    }
    async before(body, accessToken) {
        if (!validateUserDetailUpdateType(body)) {
            throw new BlError("Invalid UserDetailUpdateType request body").code(701);
        }
        const { name, address, postCity, dob, postCode, phone, emailConfirmed, guardian, } = body;
        if (emailConfirmed !== undefined && accessToken.permission === "customer") {
            throw new BlError("bruker kan ikke endre egen e-post-bekreftet-status").code(911);
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
const validateUserDetailUpdateType = (candidate) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _typeofTypeHelper = typeof "";
    const isTypeOrUndefined = (key, typeName) => candidate[key] === undefined || typeof candidate[key] === typeName;
    try {
        const stringKeys = [
            "name",
            "address",
            "postCity",
            "dob",
            "postCode",
            "phone",
        ];
        return (stringKeys.every((key) => isTypeOrUndefined(key, "string")) &&
            isTypeOrUndefined("emailConfirmed", "boolean") &&
            isTypeOrUndefined("guardian", "object"));
    }
    catch {
        return false;
    }
};
