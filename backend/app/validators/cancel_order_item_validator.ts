import vine from "@vinejs/vine";

export const cancelOrderItemValidator = vine.compile(
  vine.object({
    orderId: vine.string(),
    itemId: vine.string(),
  }),
);
