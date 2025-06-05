import vine from "@vinejs/vine";

export const subjectChoicesValidator = vine.compile(
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
