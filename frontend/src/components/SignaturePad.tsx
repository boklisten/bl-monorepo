import { ActionIcon, Box, Tooltip } from "@mantine/core";
import { IconEraser } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
// eslint-disable-next-line import-x/no-named-as-default
import SignatureCanvas from "react-signature-canvas";

export default function SignaturePad({
  onChange,
}: {
  onChange: (base64EncodedImage: string) => void;
}) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resize = () => {
      if (!sigCanvas.current) return;
      const canvas = sigCanvas.current.getCanvas();
      const box = containerRef.current;
      if (canvas && box) {
        canvas.width = box.offsetWidth;
        canvas.height = box.offsetHeight;
        sigCanvas.current.clear();
        onChange("");
      }
    };
    // Ensure everything is rendered properly before resize is called
    setTimeout(resize, 10);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [onChange]);

  return (
    <Box
      ref={containerRef}
      style={{
        border: "2px solid gray",
        borderRadius: 5,
        aspectRatio: 3,
        position: "relative",
      }}
    >
      {/* @ts-expect-error bad typings from react-signature-canvas*/}
      <SignatureCanvas
        onEnd={() => {
          if (!sigCanvas.current) return;
          const header = "data:image/png;base64,";
          const dataUrl = sigCanvas.current.toDataURL("image/png");
          onChange(dataUrl.slice(header.length));
        }}
        canvasProps={{
          style: { position: "absolute" },
        }}
        ref={sigCanvas}
      />
      <Tooltip label={"Tøm"}>
        <ActionIcon
          color={"dark"}
          variant={"subtle"}
          pos={"absolute"}
          right={0}
          bottom={0}
          onClick={() => {
            sigCanvas.current?.clear();
            onChange("");
          }}
        >
          <IconEraser />
        </ActionIcon>
      </Tooltip>
    </Box>
  );
}
