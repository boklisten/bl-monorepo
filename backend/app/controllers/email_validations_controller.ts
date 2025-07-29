import { HttpContext } from "@adonisjs/core/http";

import Messenger from "#services/messenger/messenger";
import { PermissionService } from "#services/permission_service";
import { BlStorage } from "#services/storage/bl-storage";

export default class EmailValidationsController {
  async create(ctx: HttpContext) {
    const { detailsId } = PermissionService.authenticate(ctx);

    const userDetail = await BlStorage.UserDetails.get(detailsId);

    const emailValidation = await BlStorage.EmailValidations.add({
      userDetailId: detailsId,
    });
    await Messenger.emailConfirmation(userDetail.email, emailValidation.id);
  }

  async confirm({ request, response }: HttpContext) {
    const id = request.param("id");
    try {
      const emailValidation = await BlStorage.EmailValidations.get(id);
      await BlStorage.UserDetails.update(emailValidation.userDetailId, {
        emailConfirmed: true,
      });
    } catch {
      response.status(404);
    }
  }
}
