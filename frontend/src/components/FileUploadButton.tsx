import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { ReactNode } from "react";

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
}

export default function FileUploadButton({
  startIcon,
  label,
  onUpload,
  accept,
  multiple = false,
}: FileUploadButtonProps) {
  return (
    <Button
      component="label"
      tabIndex={-1}
      startIcon={startIcon ?? <CloudUploadIcon />}
    >
      {label ?? "Upload File"}
      <VisuallyHiddenInput
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => onUpload(e.target.files)}
      />
    </Button>
  );
}
