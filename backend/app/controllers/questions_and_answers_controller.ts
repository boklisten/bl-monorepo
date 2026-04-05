import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/permission_service";
import { questionsAndAnswersValidator } from "#validators/questions_and_answers_validator";
import QuestionAndAnswer from "#models/question_and_answer";
import QuestionAndAnswerTransformer from "#transformers/question_and_answer_transformer";

export default class QuestionsAndAnswersController {
  async getAll({ serialize }: HttpContext) {
    return serialize(
      QuestionAndAnswerTransformer.transform(
        await QuestionAndAnswer.query().orderBy("createdAt", "asc"),
      ),
    );
  }

  async store(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    const { question, answer } = await ctx.request.validateUsing(questionsAndAnswersValidator);
    await QuestionAndAnswer.create({ question, answer });
  }

  async update(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    const { question, answer } = await ctx.request.validateUsing(questionsAndAnswersValidator);
    const questionAndAnswer = await QuestionAndAnswer.findOrFail(ctx.request.param("id"));
    await questionAndAnswer.merge({ question, answer }).save();
  }

  async destroy(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    const questionAndAnswer = await QuestionAndAnswer.findOrFail(ctx.request.param("id"));
    await questionAndAnswer.delete();
  }
}
