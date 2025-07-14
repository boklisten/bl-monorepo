import { Schema } from "mongoose";

import { BlSchema } from "#services/storage/bl-storage";
import { QuestionAndAnswer } from "#shared/questions-and-answers/question-and-answer";

export const QuestionsAndAnswersSchema: BlSchema<QuestionAndAnswer> =
  new Schema({
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  });
