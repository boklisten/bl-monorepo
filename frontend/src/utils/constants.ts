export const CONTACT_INFO = {
  email: "info@boklisten.no",
  phone: "91002211",
  address: "Postboks 8, 1316 Eiksmarka",
} as const satisfies { email: string; phone: string; address: string };
