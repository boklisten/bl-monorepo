import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/permission_service";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { editableTextsValidator } from "#validators/editable_texts_validator";

export default class EditableTextsController {
  async getByKey({ request }: HttpContext) {
    const key = request.param("key");
    const databaseQuery = new SEDbQuery();
    databaseQuery.stringFilters = [{ fieldName: "key", value: key }];
    const [editableText] =
      await BlStorage.EditableTexts.getByQuery(databaseQuery);
    if (!editableText) {
      throw new Error(`No editable text found for key ${key}`);
    }
    return editableText;
  }

  async getAll(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

    return await BlStorage.EditableTexts.getAll();
  }

  async store(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

    const validatedData = await ctx.request.validateUsing(
      editableTextsValidator,
    );
    return await BlStorage.EditableTexts.add(validatedData);
  }

  async update(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

    const id = ctx.request.param("id");
    const { text } = ctx.request.only(["text"]);
    return await BlStorage.EditableTexts.update(id, { text });
  }

  async destroy(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

    const id = ctx.request.param("id");
    return await BlStorage.EditableTexts.remove(id);
  }
}
