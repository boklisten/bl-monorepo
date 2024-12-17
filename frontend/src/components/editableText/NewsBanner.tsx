import EditableTextElement from "@frontend/components/editableText/EditableTextElement";
import theme from "@frontend/utils/theme";
import { Box } from "@mui/material";
import { ComponentProps } from "react";

const NewsBanner = (props: ComponentProps<typeof EditableTextElement>) => {
  if (
    props.editableText.text === null ||
    props.editableText.text.length === 0
  ) {
    return <EditableTextElement {...props} />;
  }
  return (
    <Box
      sx={{
        borderColor: theme.palette.warning.main,
        borderWidth: 3,
        borderStyle: "solid",
        borderRadius: 1,
        backgroundColor: "#ffffff",
        color: theme.palette.warning.contrastText,
        padding: 1,
        my: 5,
        mx: "auto",
        width: "fit-content",
      }}
    >
      <EditableTextElement {...props} />
    </Box>
  );
};

export default NewsBanner;
