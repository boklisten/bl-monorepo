import type { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/auth/permission.service";
import CollectionEndpointAuth from "#services/collection-endpoint/collection-endpoint-auth";
import { sendMail } from "#services/messenger/email/email_service";
import { EMAIL_SENDER } from "#services/messenger/email/email_templates";
import { emailTemplateSenderValidator } from "#validators/mail_template_sender";
import { assertSendGridTemplateId } from "#validators/send_grid_template_id_validator";

async function canAccess(ctx: HttpContext) {
  try {
    const accessToken = await CollectionEndpointAuth.authenticate(
      { permission: "admin" },
      ctx,
    );
    return !!(
      accessToken &&
      PermissionService.isPermissionEqualOrOver(
        accessToken?.["permission"],
        "admin",
      )
    );
  } catch {
    return false;
  }
}

export default class MailTemplateSenderController {
  async sendEmails(ctx: HttpContext) {
    if (!(await canAccess(ctx))) {
      return ctx.response.unauthorized();
    }

    const { emailTemplateId, emails } = await ctx.request.validateUsing(
      emailTemplateSenderValidator,
    );

    return await sendMail({
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
