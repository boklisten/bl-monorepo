import { SerializedSignature } from "@boklisten/bl-model";

import { serializeSignature } from "@/collections/signature/helpers/signature.helper";
import { Signature } from "@/collections/signature/signature.schema";
import { Hook } from "@/hook/hook";

export class SignatureGetIdHook extends Hook {
  public override async after(
    docs: Signature[],
  ): Promise<SerializedSignature[]> {
    return docs.map((signature) => serializeSignature(signature));
  }
}
