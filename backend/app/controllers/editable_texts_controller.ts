import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/permission_service";
import { editableTextsValidator } from "#validators/editable_texts_validator";
import EditableText from "#models/editable_text";

// fixme: use AdonisJS Transformer here
export default class EditableTextsController {
  async get(ctx: HttpContext) {
    const { id, text } = await EditableText.findOrFail(ctx.request.param("id"));
    return { id, text };
  }

  async getAll(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    return (await EditableText.all()).map(({ id, text }) => ({ id, text }));
  }

  async upsert(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    const payload = await ctx.request.validateUsing(editableTextsValidator);
    const { id, text } = await EditableText.updateOrCreate(
      { id: payload.params.id },
      { text: payload.text },
    );
    return { id, text };
  }

  async destroy(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    const editableText = await EditableText.findOrFail(ctx.request.param("id"));
    await editableText.delete();
  }
}
