import vine from "@vinejs/vine";

export const questionsAndAnswersValidator = vine.compile(
  vine.object({
    question: vine.string(),
    answer: vine.string(),
  }),
);
