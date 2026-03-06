import vine from "@vinejs/vine";

export const subjectChoicesValidator = vine.create(
  vine.object({
    branchId: vine.string(),
    subjectChoices: vine.array(
      vine.object({
        subjects: vine.array(vine.string()),
        phone: vine.string(),
      }),
    ),
  }),
);
