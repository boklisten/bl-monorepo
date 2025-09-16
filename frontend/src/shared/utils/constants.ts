export const CONTACT_INFO = {
  email: "info@boklisten.no",
  phone: "91002211",
  address: "Postboks 8, 1316 Eiksmarka",
} as const satisfies { email: string; phone: string; address: string };

export const PLEASE_TRY_AGAIN_TEXT =
  "Vennligst prøv igjen eller ta kontakt hvis problemet vedvarer";
export const GENERIC_ERROR_TEXT = "Noe gikk galt!";
