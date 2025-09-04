"use client";
import { QuestionAndAnswer } from "@boklisten/backend/shared/question-and-answer";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DialogProps, useNotifications } from "@toolpad/core";
import { RichTextEditorRef } from "mui-tiptap";
import { useRef } from "react";

import { TextEditor } from "@/components/TextEditor";
import useApiClient from "@/hooks/useApiClient";
import {
  ERROR_NOTIFICATION,
  SUCCESS_NOTIFICATION,
} from "@/utils/notifications";

export default function QuestionAndAnswerEditDialog({
  payload,
  open,
  onClose,
}: DialogProps<QuestionAndAnswer | undefined>) {
  const questionRteRef = useRef<RichTextEditorRef>(null);
  const answerRteRef = useRef<RichTextEditorRef>(null);
  const notifications = useNotifications();

  const queryClient = useQueryClient();
  const client = useApiClient();
  const addQuestionAndAnswerMutation = useMutation({
    mutationFn: (
      questionAndAnswer: Pick<QuestionAndAnswer, "question" | "answer">,
    ) => client.questions_and_answers.$post(questionAndAnswer).unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.questions_and_answers.$url()],
      }),
    onSuccess: () => {
      notifications.show(
        "Spørsmål og svar ble opprettet!",
        SUCCESS_NOTIFICATION,
      );
      onClose();
    },
    onError: () =>
      notifications.show(
        `Klarte ikke opprette spørsmål og svar!`,
        ERROR_NOTIFICATION,
      ),
  });

  const updateQuestionAndAnswerMutation = useMutation({
    mutationFn: (questionAndAnswer: QuestionAndAnswer) =>
      client
        .questions_and_answers({ id: questionAndAnswer.id })
        .$patch(questionAndAnswer)
        .unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.questions_and_answers.$url()],
      }),
    onSuccess: () => {
      notifications.show(
        "Dynamisk innhold ble oppdatert!",
        SUCCESS_NOTIFICATION,
      );
      onClose();
    },
    onError: () =>
      notifications.show(
        "Klarte ikke oppdatere dynamisk innhold!",
        ERROR_NOTIFICATION,
      ),
  });

  async function handleSubmit() {
    if (payload === undefined) {
      addQuestionAndAnswerMutation.mutate({
        question: questionRteRef.current?.editor?.getHTML() ?? "",
        answer: answerRteRef.current?.editor?.getHTML() ?? "",
      });
    } else {
      updateQuestionAndAnswerMutation.mutate({
        id: payload.id,
        question: questionRteRef.current?.editor?.getHTML() ?? "",
        answer: answerRteRef.current?.editor?.getHTML() ?? "",
      });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      slotProps={{
        paper: {
          sx: {
            width: 800,
            maxWidth: "90%",
          },
        },
      }}
    >
      <DialogTitle>
        {payload === undefined ? "Opprett" : "Rediger"} spørsmål og svar
      </DialogTitle>
      <DialogContent>
        <Stack gap={2} mt={1}>
          <Box>
            <Typography variant={"h2"} mb={2}>
              Spørsmål
            </Typography>
            <TextEditor
              content={payload?.question ?? ""}
              rteRef={questionRteRef}
            />
          </Box>
          <Box>
            <Typography variant={"h2"} mb={2}>
              Svar
            </Typography>
            <TextEditor content={payload?.answer ?? ""} rteRef={answerRteRef} />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Avbryt</Button>
        <Button
          loading={
            addQuestionAndAnswerMutation.isPending ||
            updateQuestionAndAnswerMutation.isPending
          }
          onClick={handleSubmit}
        >
          {payload === undefined ? "Opprett" : "Lagre"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
