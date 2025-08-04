import { Schema } from "mongoose";

import { BlSchema } from "#services/storage_service";
import { QuestionAndAnswer } from "#shared/question-and-answer";

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
