import vine from "@vinejs/vine";

export const initializeCheckoutValidator = vine.compile(
  vine.object({
    cartItems: vine.array(
      vine.object({
        id: vine.string(),
        branchId: vine.string(),
        type: vine.enum(["rent", "partly-payment", "extend", "buy", "buyout"]),
        to: vine.date().optional(),
      }),
    ),
  }),
);

export const vippsCallbackValidator = vine.compile(
  vine.object({
    reference: vine.string(),
    sessionState: vine.string(),
    paymentMethod: vine.string(),
  }),
);
