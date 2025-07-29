import { Signature } from "#models/signature.schema";
import { serializeSignature } from "#services/legacy/collections/signature/helpers/signature.helper";
import { Hook } from "#services/legacy/hook";
import { SerializedSignature } from "#shared/signature/serialized-signature";

export class SignatureGetIdHook extends Hook {
  public override async after(
    docs: Signature[],
  ): Promise<SerializedSignature[]> {
    return docs.map((signature) => serializeSignature(signature));
  }
}
