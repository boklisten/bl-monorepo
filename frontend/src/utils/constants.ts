import { LinkTabProps } from "@/components/info/DynamicNav";

export const INFO_PAGE_TABS = [
  { label: "Generell informasjon", href: "/info/general" },
  { label: "Spørsmål og svar", href: "/info/faq" },
  { label: "For VGS-elever", href: "/info/pupils" },
  { label: "Skoler og åpningstider", href: "/info/branch" },
  { label: "Avtaler og betingelser", href: "/info/policies/conditions" },
  { label: "Om oss", href: "/info/about" },
  { label: "For skolekunder", href: "/info/companies" },
  { label: "Innkjøpsliste", href: "/info/buyback" },
  { label: "Kontakt oss", href: "/info/contact" },
] as const satisfies LinkTabProps[];

export const TERMS_AND_CONDITIONS_TABS = [
  {
    href: "/info/policies/conditions",
    label: "Betingelser",
  },
  {
    href: "/info/policies/terms",
    label: "Vilkår",
  },
  {
    href: "/info/policies/privacy",
    label: "Personvernavtale",
  },
] as const satisfies LinkTabProps[];

export const CONTACT_INFO = {
  email: "info@boklisten.no",
  phone: "91002211",
  address: "Postboks 8, 1316 Eiksmarka",
} as const satisfies { email: string; phone: string; address: string };
