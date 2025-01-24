export const EMAIL_SETTINGS = {
    types: {
        receipt: {
            fromEmail: "ikkesvar@boklisten.no",
            subject: "Kvittering fra Boklisten.no",
        },
        emailConfirmation: {
            fromEmail: "ikkesvar@boklisten.no",
            subject: "Bekreft e-posten din hos Boklisten.no",
            path: "auth/email/confirm/",
            templateId: "d-8734d0fdf5fc4d99bf22553c3a0c724a",
        },
        passwordReset: {
            fromEmail: "ikkesvar@boklisten.no",
            subject: "Tilbakestill passordet hos Boklisten.no",
            path: "auth/reset/",
            templateId: "d-66e886995d4e46a0adfb133a163952d9",
        },
        guardianSignature: {
            fromEmail: "ikkesvar@boklisten.no",
            subject: "Signer låneavtale hos Boklisten.no",
            path: "signering/",
            templateId: "d-e0eaab765bae483c95f76a178853de74",
        },
        deliveryInformation: {
            fromEmail: "ikkesvar@boklisten.no",
            subject: "Dine bøker er på vei",
        },
    },
};
