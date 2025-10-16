import vine from "@vinejs/vine";

const buyoutOrExtendCartItem = vine
  .group([
    vine.group.if((data) => data["type"] === "extend", {
      type: vine.literal("extend"),
      date: vine.date(),
    }),
    vine.group.if((data) => data["type"] === "buyout", {
      type: vine.literal("buyout"),
    }),
  ])
  .otherwise((_, field) => {
    field.report(
      "Cart item must be either a valid extend or buyout",
      "buyout_or_extend_cart_item",
      field,
    );
  });

export const initializeCheckoutValidator = vine.compile(
  vine.object({
    cartItems: vine.array(
      vine
        .object({
          itemId: vine.string(),
        })
        .merge(buyoutOrExtendCartItem),
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
