import { Stack } from "@mui/material";

import EditableTextManager from "@/components/info/editable-text/EditableTextManager";
import QuestionsAndAnswersManager from "@/components/info/questions-and-answers/QuestionsAndAnswersManager";

export default function EditableTextPage() {
  return (
    <Stack gap={5}>
      <EditableTextManager />
      <QuestionsAndAnswersManager />
    </Stack>
  );
}
