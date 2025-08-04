import type { HttpContext } from "@adonisjs/core/http";

import DispatchService from "#services/dispatch_service";
import { PermissionService } from "#services/permission_service";
import { EMAIL_SENDER } from "#types/email_templates";
import { emailTemplateSenderValidator } from "#validators/mail_template_sender";
import { assertSendGridTemplateId } from "#validators/send_grid_template_id_validator";

export default class MailTemplateSenderController {
  async sendEmails(ctx: HttpContext) {
    PermissionService.adminOrFail(ctx);

    const { emailTemplateId, emails } = await ctx.request.validateUsing(
      emailTemplateSenderValidator,
    );

    return await DispatchService.sendEmail({
      template: {
        sender: EMAIL_SENDER.INFO,
        templateId: assertSendGridTemplateId(emailTemplateId),
      },
      recipients: emails.map((email) => ({
        to: email,
      })),
    });
  }
}
