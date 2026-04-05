import { BaseTransformer } from "@adonisjs/core/transformers";
import QuestionAndAnswer from "#models/question_and_answer";

export default class QuestionAndAnswerTransformer extends BaseTransformer<QuestionAndAnswer> {
  toObject() {
    return {
      id: this.resource.id.toString(),
      ...this.pick(this.resource, ["question", "answer"]),
    };
  }
}
