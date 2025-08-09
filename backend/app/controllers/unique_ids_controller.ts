import { HttpContext } from "@adonisjs/core/http";

import UniqueIdGeneratorService from "#services/unique_id_generator_service";

export default class UniqueIdsController {
  async downloadUniqueIdPdf(ctx: HttpContext) {
    const pdf = await UniqueIdGeneratorService.generateUniqueIdPdf();
    ctx.response
      .header("Content-Type", "application/pdf")
      .header("Content-Length", String(pdf.length))
      .header("Content-Disposition", 'attachment; filename="unique-ids.pdf"')
      .send(pdf);
  }
}
