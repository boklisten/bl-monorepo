import { serializeSignature } from "@backend/collections/signature/helpers/signature.helper";
import { Signature } from "@backend/collections/signature/signature.schema";
import { Hook } from "@backend/hook/hook";
import { SerializedSignature } from "@shared/signature/serialized-signature";

export class SignatureGetIdHook extends Hook {
  public override async after(
    docs: Signature[],
  ): Promise<SerializedSignature[]> {
    return docs.map((signature) => serializeSignature(signature));
  }
}
