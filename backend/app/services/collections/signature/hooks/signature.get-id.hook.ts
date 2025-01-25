import { SerializedSignature } from "@shared/signature/serialized-signature.js";

import { serializeSignature } from "#services/collections/signature/helpers/signature.helper";
import { Hook } from "#services/hook/hook";
import { Signature } from "#services/storage/models/signature.model";

export class SignatureGetIdHook extends Hook {
  public override async after(
    docs: Signature[],
  ): Promise<SerializedSignature[]> {
    return docs.map((signature) => serializeSignature(signature));
  }
}
