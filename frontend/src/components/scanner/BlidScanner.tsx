import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";

import { ScannedTextType, TextType } from "@/utils/types";

export function determineScannedTextType(scannedText: string): ScannedTextType {
  if (/^[\dA-Za-z]{12}$|^\d{8}$/.test(scannedText)) {
    return TextType.BLID;
  } else if (/^\d{13}$/.test(scannedText)) {
    return TextType.ISBN;
  }

  return TextType.UNKNOWN;
}

export default function BlidScanner({
  onResult,
}: {
  onResult: (scannedText: string) => Promise<void>;
}) {
  const handleCodeDetection = async (
    detectedCodes: IDetectedBarcode[],
  ): Promise<void> => {
    const didFindBlid = detectedCodes.some(
      (code) => determineScannedTextType(code.rawValue) === TextType.BLID,
    );
    const codesToProcess = didFindBlid
      ? detectedCodes.filter(
          (code) => determineScannedTextType(code.rawValue) === TextType.BLID,
        )
      : detectedCodes;

    for (const code of codesToProcess) {
      try {
        await onResult(code.rawValue);
      } catch (error) {
        console.error("Failed to handle scan", error);
      }
      // Arbitrary delay to somewhat avoid races the backend isn't smart enough to handle
      await new Promise((resolve) => {
        globalThis.setTimeout(resolve, 250);
      });
    }
  };

  return (
    <Scanner
      constraints={{ facingMode: "environment" }}
      formats={["qr_code", "code_128", "ean_8", "ean_13"]}
      components={{ torch: true }}
      onScan={handleCodeDetection}
      scanDelay={500}
    />
  );
}
