import vine from "@vinejs/vine";

export const questionsAndAnswersValidator = vine.create(
  vine.object({
    question: vine.string(),
    answer: vine.string(),
  }),
);
