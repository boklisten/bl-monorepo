import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { questionsAndAnswersValidator } from "#validators/questions_and_answers_validator";

export default class QuestionsAndAnswersController {
  async getAll() {
    return await StorageService.QuestionsAndAnswers.getAll();
  }

  async store(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

    const validatedData = await ctx.request.validateUsing(
      questionsAndAnswersValidator,
    );
    return await StorageService.QuestionsAndAnswers.add(validatedData);
  }

  async update(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

    const validatedData = await ctx.request.validateUsing(
      questionsAndAnswersValidator,
    );

    const id = ctx.request.param("id");
    return await StorageService.QuestionsAndAnswers.update(id, validatedData);
  }

  async destroy(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

    const id = ctx.request.param("id");
    return await StorageService.QuestionsAndAnswers.remove(id);
  }
}
