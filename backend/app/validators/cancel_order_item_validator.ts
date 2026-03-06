import vine from "@vinejs/vine";

export const cancelOrderItemValidator = vine.create(
  vine.object({
    orderId: vine.string(),
    itemId: vine.string(),
  }),
);
