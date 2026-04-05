import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/permission_service";
import { questionsAndAnswersValidator } from "#validators/questions_and_answers_validator";
import QuestionAndAnswer from "#models/question_and_answer";

export default class QuestionsAndAnswersController {
  async getAll() {
    return (await QuestionAndAnswer.query().orderBy("createdAt", "asc")).map(
      ({ id, question, answer }) => ({
        id: id.toString(),
        question,
        answer,
      }),
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
