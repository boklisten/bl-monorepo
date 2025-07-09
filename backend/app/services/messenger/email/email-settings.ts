export const EMAIL_SETTINGS = {
  receipt: {
    subject: "Kvittering fra Boklisten.no",
    templateId: "d-dc8ab3365a0f4fd8a69b6a38e6eb83f9",
  },
  emailConfirmation: {
    subject: "Bekreft e-posten din hos Boklisten.no",
    path: "auth/email/confirm/",
    templateId: "d-8734d0fdf5fc4d99bf22553c3a0c724a",
  },
  passwordReset: {
    subject: "Tilbakestill passordet hos Boklisten.no",
    path: "auth/reset/",
    templateId: "d-66e886995d4e46a0adfb133a163952d9",
  },
  guardianSignature: {
    subject: "Signer låneavtale hos Boklisten.no",
    path: "signering/",
    templateId: "d-e0eaab765bae483c95f76a178853de74",
  },
  deliveryInformation: {
    subject: "Dine bøker er på vei",
    templateId: "d-dc8ab3365a0f4fd8a69b6a38e6eb83f9",
  },
  matchNotify: {
    templateId: "d-b6d2e8bcf3bc4e6e9aef3f8eb49f1c64",
  },
} as const;

export const EMAIL_SENDER = {
  NO_REPLY: "ikkesvar@boklisten.no",
  INFO: "info@boklisten.no",
} as const satisfies Record<
  Uppercase<string>,
  `${Lowercase<string>}@boklisten.no`
>;

export type AllowedEmailSender =
  (typeof EMAIL_SENDER)[keyof typeof EMAIL_SENDER];
