import vine from "@vinejs/vine";
export const initializeCheckoutValidator = vine.compile(
  vine.object({
    cartItems: vine.array(
      vine.object({
        itemId: vine.string(),
        type: vine.enum(["extend", "buyout"]),
        date: vine.date().optional(),
      }),
    ),
  }),
);
