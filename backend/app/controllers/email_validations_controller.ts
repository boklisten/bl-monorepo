import { HttpContext } from "@adonisjs/core/http";

import DispatchService from "#services/dispatch_service";
import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";

export default class EmailValidationsController {
  async create(ctx: HttpContext) {
    const { detailsId } = PermissionService.authenticate(ctx);

    const userDetail = await StorageService.UserDetails.get(detailsId);

    const emailValidation = await StorageService.EmailValidations.add({
      userDetailId: detailsId,
    });
    await DispatchService.sendEmailConfirmation(
      userDetail.email,
      emailValidation.id,
    );
  }

  async confirm({ request, response }: HttpContext) {
    const id = request.param("id");
    try {
      const emailValidation = await StorageService.EmailValidations.get(id);
      await StorageService.UserDetails.update(emailValidation.userDetailId, {
        emailConfirmed: true,
      });
      return { confirmed: true };
    } catch {
      response.status(404);
    }
    return { confirmed: false };
  }
}
