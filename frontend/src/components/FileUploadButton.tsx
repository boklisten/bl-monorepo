import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { ReactNode, useRef } from "react";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface FileUploadButtonProps {
  startIcon?: ReactNode;
  label?: string;
  onUpload: (files: FileList | null) => void;
  accept?: string;
  multiple?: boolean;
  loading?: boolean;
}

export default function FileUploadButton({
  startIcon,
  label,
  onUpload,
  accept,
  multiple = false,
  loading = false,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Button
      component="label"
      tabIndex={-1}
      startIcon={startIcon ?? <CloudUploadIcon />}
      loading={loading}
    >
      {label ?? "Upload File"}
      <VisuallyHiddenInput
        type="file"
        accept={accept}
        multiple={multiple}
        ref={inputRef}
        onChange={(e) => {
          onUpload(e.target.files);
          if (inputRef.current) {
            inputRef.current.value = "";
          }
        }}
      />
    </Button>
  );
}
