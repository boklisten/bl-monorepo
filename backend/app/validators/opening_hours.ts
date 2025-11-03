import vine from "@vinejs/vine";

export const openingHoursValidator = vine.compile(
  vine.object({
    branchId: vine.string(),
    from: vine.date({ formats: ["iso8601"] }).afterOrEqual("today"),
    to: vine.date({ formats: ["iso8601"] }).afterOrEqual("today"),
  }),
);
