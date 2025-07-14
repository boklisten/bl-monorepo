import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/auth/permission.service";
import { BlStorage } from "#services/storage/bl-storage";
import { questionsAndAnswersValidator } from "#validators/questions_and_answers_validator";

export default class QuestionsAndAnswersController {
  async getAll() {
    return await BlStorage.QuestionsAndAnswers.getAll();
  }

  async store(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

    const validatedData = await ctx.request.validateUsing(
      questionsAndAnswersValidator,
    );
    return await BlStorage.QuestionsAndAnswers.add(validatedData);
  }

  async update(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

    const validatedData = await ctx.request.validateUsing(
      questionsAndAnswersValidator,
    );

    const id = ctx.request.param("id");
    return await BlStorage.QuestionsAndAnswers.update(id, validatedData);
  }

  async destroy(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

    const id = ctx.request.param("id");
    return await BlStorage.QuestionsAndAnswers.remove(id);
  }
}
