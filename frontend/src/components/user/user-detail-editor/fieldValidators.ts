import BlFetcher from "@frontend/api/blFetcher";
import { UserEditorFields } from "@frontend/components/user/user-detail-editor/useUserDetailEditorForm";
import BL_CONFIG from "@frontend/utils/bl-config";
import moment from "moment/moment";
import { RegisterOptions } from "react-hook-form";
import isEmail from "validator/lib/isEmail";
import isMobilePhone from "validator/lib/isMobilePhone";
import isPostalCode from "validator/lib/isPostalCode";

export const fieldValidators: {
  [K in keyof UserEditorFields]: RegisterOptions<UserEditorFields>;
} = {
  email: {
    required: "Du må fylle inn e-post",
    validate: (v) => (isEmail(v) ? true : "Du må fylle inn en gyldig e-post"),
  },
  password: {
    required: "Du må fylle inn passord",
    minLength: {
      value: 10,
      message: "Passordet må minst ha 10 tegn",
    },
  },
  name: {
    required: "Du må fylle inn ditt fulle navn",
    validate: (v: string) =>
      v.split(" ").length > 1
        ? true
        : "Du må fylle inn både fornavn og etternavn",
  },
  phoneNumber: {
    required: "Du må fylle inn telefonnummer",
    validate: (v) =>
      isMobilePhone(v, "nb-NO")
        ? true
        : "Du må fylle inn et gyldig norsk telefonnummer (uten mellomrom og +47)",
    minLength: {
      value: 8,
      message: "Telefonnummeret må være 8 tegn langt (uten mellomrom og +47)",
    },
    maxLength: {
      value: 8,
      message: "Telefonnummeret må være 8 tegn langt (uten mellomrom og +47)",
    },
  },
  address: {
    required: "Du må fylle inn adresse",
  },
  postalCode: {
    required: "Du må fylle inn postnummer",
    validate: async (v) => {
      const illegalPostalCodeMessage = "Du må oppgi et gyldig norsk postnummer";
      if (!isPostalCode(v, "NO")) {
        return illegalPostalCodeMessage;
      }

      const response = await BlFetcher.post<
        [
          {
            postalCity: string | null;
          },
        ]
      >(
        `${BL_CONFIG.collection.delivery}/${BL_CONFIG.delivery.postalCodeLookup.operation}`,
        { postalCode: v },
      );

      if (!response[0].postalCity) {
        return illegalPostalCodeMessage;
      }

      return true;
    },
  },
  birthday: {
    required: "Du må fylle inn fødselsdato",
    valueAsDate: true,
    validate: (v) =>
      v?.isValid() &&
      v.isAfter(moment().subtract(100, "years")) &&
      v.isBefore(moment().subtract(10, "years"))
        ? true
        : "Du må fylle inn en gyldig fødselsdato",
  },
  guardianName: {
    required: "Du må fylle inn foresatt sitt fulle navn",
  },
  guardianEmail: {
    required: "Du må fylle inn foresatt sin epost",
    validate: (v, otherFields) => {
      if (!isEmail(v)) return "Du må fylle inn en gyldig e-post for foresatt";

      if (v === otherFields.email)
        return `Foresatt sin e-post må være forskjellig fra kontoens e-post (${otherFields.email})`;

      return true;
    },
  },
  guardianPhoneNumber: {
    required: "Du må fylle inn foresatt sitt telefonnummer",
    validate: (v, otherFields) => {
      if (!isMobilePhone(v, "nb-NO"))
        return "Du må fylle inn et gyldig norsk telefonnummer (uten mellomrom og +47)";

      if (v === otherFields.phoneNumber)
        return `Foresatt sitt telefonnummer må være forskjellig fra kontoens telefonnummer (${otherFields.phoneNumber})`;

      return true;
    },
    minLength: {
      value: 8,
      message: "Telefonnummeret må være 8 tegn langt (uten mellomrom og +47)",
    },
    maxLength: {
      value: 8,
      message: "Telefonnummeret må være 8 tegn langt (uten mellomrom og +47)",
    },
  },
  agreeToTermsAndConditions: {
    required: "Du må godta våre betingelser og vilkår",
  },
};
