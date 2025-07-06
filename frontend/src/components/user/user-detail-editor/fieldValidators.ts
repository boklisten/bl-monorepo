import moment from "moment/moment";
import { RegisterOptions } from "react-hook-form";
import validator from "validator";
import isMobilePhone from "validator/lib/isMobilePhone";
import isPostalCode from "validator/lib/isPostalCode";

import BlFetcher from "@/api/blFetcher";
import { UserEditorFields } from "@/components/user/user-detail-editor/useUserDetailEditorForm";
import { publicApiClient } from "@/utils/api/publicApiClient";

export const fieldValidators: {
  [K in keyof UserEditorFields]: RegisterOptions<UserEditorFields>;
} = {
  email: {
    required: "Du må fylle inn e-post",
    validate: (v) =>
      validator.isEmail(v) ? true : "Du må fylle inn en gyldig e-post",
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
  signUpPhoneNumber: {
    required: "Du må fylle inn telefonnummer",
    validate: async (v) => {
      if (!isMobilePhone(v, "nb-NO"))
        return "Du må fylle inn et gyldig norsk telefonnummer (uten mellomrom og +47)";

      const existingAccount =
        await publicApiClient.v2.userdetails.check_phone_number_already_registered
          .$post({
            phone: v,
          })
          .unwrap();
      if (existingAccount) {
        return "Det finnes allerede en konto med dette nummeret. Ta kontakt med oss på info@boklisten.no hvis du trenger hjelp med å logge inn.";
      }

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
        publicApiClient.$url(
          "collection.deliveries.operation.postal-code-lookup.post",
        ),
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
      if (!validator.isEmail(v))
        return "Du må fylle inn en gyldig e-post for foresatt";

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
  branchMembership: {
    required: "Du må velge din skole",
  },
};
