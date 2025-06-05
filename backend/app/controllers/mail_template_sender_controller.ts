import type { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/auth/permission.service";
import CollectionEndpointAuth from "#services/collection-endpoint/collection-endpoint-auth";
import { sendMailV2 } from "#services/messenger/email/email-service";
import { emailTemplateSenderValidator } from "#validators/mail_template_sender";

async function canAccess(ctx: HttpContext) {
  try {
    const accessToken = await CollectionEndpointAuth.authenticate(
      { permission: "admin" },
      ctx,
    );
    return !!(
      accessToken &&
      PermissionService.isPermissionEqualOrOver(
        accessToken?.permission,
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

    return await sendMailV2(
      "info@boklisten.no",
      emailTemplateId,
      emails.map((email) => ({
        to: email,
      })),
    );
  }
}
