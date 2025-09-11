"use client";
import { QuestionAndAnswer } from "@boklisten/backend/shared/question-and-answer";
import { ContextModalProps } from "@mantine/modals";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RichTextEditorRef } from "mui-tiptap";
import { useRef } from "react";

import { TextEditor } from "@/components/TextEditor";
import useApiClient from "@/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

export default function QuestionAndAnswerEditDialog({
  context,
  id,
  innerProps: { questionAndAnswer },
}: ContextModalProps<{
  questionAndAnswer?: QuestionAndAnswer | undefined;
}>) {
  const questionRteRef = useRef<RichTextEditorRef>(null);
  const answerRteRef = useRef<RichTextEditorRef>(null);

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
      showSuccessNotification("Spørsmål og svar ble opprettet!");
      context.closeModal(id);
    },
    onError: () =>
      showErrorNotification("Klarte ikke opprette spørsmål og svar!"),
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
      showSuccessNotification("Dynamisk innhold ble oppdatert!");
      context.closeModal(id);
    },
    onError: () =>
      showErrorNotification("Klarte ikke oppdatere dynamisk innhold!"),
  });

  async function handleSubmit() {
    if (questionAndAnswer === undefined) {
      addQuestionAndAnswerMutation.mutate({
        question: questionRteRef.current?.editor?.getHTML() ?? "",
        answer: answerRteRef.current?.editor?.getHTML() ?? "",
      });
    } else {
      updateQuestionAndAnswerMutation.mutate({
        id: questionAndAnswer.id,
        question: questionRteRef.current?.editor?.getHTML() ?? "",
        answer: answerRteRef.current?.editor?.getHTML() ?? "",
      });
    }
  }

  return (
    <>
      <Stack gap={2} mt={1}>
        <Box>
          <Typography variant={"h2"} mb={2}>
            Spørsmål
          </Typography>
          <TextEditor
            content={questionAndAnswer?.question ?? ""}
            rteRef={questionRteRef}
          />
        </Box>
        <Box>
          <Typography variant={"h2"} mb={2}>
            Svar
          </Typography>
          <TextEditor
            content={questionAndAnswer?.answer ?? ""}
            rteRef={answerRteRef}
          />
        </Box>
      </Stack>
      <Button onClick={() => context.closeModal(id)}>Avbryt</Button>
      <Button
        loading={
          addQuestionAndAnswerMutation.isPending ||
          updateQuestionAndAnswerMutation.isPending
        }
        onClick={handleSubmit}
      >
        {questionAndAnswer === undefined ? "Opprett" : "Lagre"}
      </Button>
    </>
  );
}
