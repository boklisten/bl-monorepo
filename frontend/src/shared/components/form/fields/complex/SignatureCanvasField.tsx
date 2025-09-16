import { ActionIcon, Box, Stack, Text, Tooltip } from "@mantine/core";
import { IconEraser } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
// eslint-disable-next-line import-x/no-named-as-default
import SignatureCanvas from "react-signature-canvas";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import { useFieldContext } from "@/shared/hooks/form";

export default function SignatureCanvasField(props: { label: string }) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const field = useFieldContext<string>();

  useEffect(() => {
    const resize = () => {
      if (!sigCanvas.current) return;
      const canvas = sigCanvas.current.getCanvas();
      const box = containerRef.current;
      if (canvas && box) {
        canvas.width = box.offsetWidth;
        canvas.height = box.offsetHeight;
        sigCanvas.current.clear();
        field.setValue("");
      }
    };
    // Ensure everything is rendered properly before resize is called
    setTimeout(resize, 10);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [field]);

  return (
    <Stack gap={5}>
      <Text size="sm" fw={500}>
        {props.label}
      </Text>
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
            field.setValue(dataUrl.slice(header.length));
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
              field.setValue("");
            }}
          >
            <IconEraser />
          </ActionIcon>
        </Tooltip>
      </Box>
      {field.state.meta.errors.length > 0 && (
        <ErrorAlert>{field.state.meta.errors.join(",")}</ErrorAlert>
      )}
    </Stack>
  );
}
