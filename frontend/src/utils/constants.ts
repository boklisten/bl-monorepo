import { LinkTabProps } from "@/components/info/DynamicNav";

export const infoPageTabs: LinkTabProps[] = [
  { label: "Generell informasjon", href: "/info/general" },
  { label: "Spørsmål og svar", href: "/info/faq" },
  { label: "For VGS-elever", href: "/info/pupils" },
  { label: "Skoler og åpningstider", href: "/info/branch" },
  { label: "Avtaler og betingelser", href: "/info/policies/conditions" },
  { label: "Om oss", href: "/info/about" },
  { label: "For skolekunder", href: "/info/companies" },
  { label: "Innkjøpsliste", href: "/info/buyback" },
  { label: "Kontakt oss", href: "/info/contact" },
];

export const termsAndConditionsTabs: LinkTabProps[] = [
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
];

export const contactInfo = {
  email: "info@boklisten.no",
  phone: "91002211",
  address: "Postboks 8, 1316 Eiksmarka",
};

export const editableTextIds = {
  frontPage: {
    newsBanner: "65a7f68e81488330ddcd6fd3",
  },
  info: {
    general: "650ae3eaa4c00a2d1c0824b3",
  },
};
