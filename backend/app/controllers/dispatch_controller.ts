import { HttpContext } from "@adonisjs/core/http";

import DispatchService from "#services/dispatch_service";
import { PermissionService } from "#services/permission_service";
import { EMAIL_TEMPLATES } from "#types/email_templates";

export default class DispatchController {
  async getEmailTemplates(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);
    return (await DispatchService.getEmailTemplates())
      .filter(
        (emailTemplate) =>
          !Object.values(EMAIL_TEMPLATES).some(
            (transactionalTemplate) =>
              transactionalTemplate.templateId === emailTemplate.id,
          ),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
