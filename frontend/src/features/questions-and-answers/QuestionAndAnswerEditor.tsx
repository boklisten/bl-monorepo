import { QuestionAndAnswer } from "@boklisten/backend/shared/question-and-answer";
import { Button, Group, Stack } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAppForm } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

export default function QuestionAndAnswerEditor({
  questionAndAnswer,
  onClose,
}: {
  questionAndAnswer?: QuestionAndAnswer | undefined;
  onClose: () => void;
}) {
  const form = useAppForm({
    defaultValues: {
      question: questionAndAnswer?.question ?? "",
      answer: questionAndAnswer?.answer ?? "",
    },
    onSubmit: ({ value }) => {
      if (questionAndAnswer === undefined) {
        addQuestionAndAnswerMutation.mutate(value);
      } else {
        updateQuestionAndAnswerMutation.mutate({
          id: questionAndAnswer.id,
          ...value,
        });
      }
    },
  });

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
      onClose();
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
      onClose();
    },
    onError: () =>
      showErrorNotification("Klarte ikke oppdatere dynamisk innhold!"),
  });

  return (
    <Stack>
      <form.AppField name={"question"}>
        {(field) => <field.RichTextEditorField label={"Spørsmål"} />}
      </form.AppField>
      <form.AppField name={"answer"}>
        {(field) => <field.RichTextEditorField label={"Svar"} />}
      </form.AppField>
      <Group>
        <Button variant={"subtle"} onClick={() => onClose()}>
          Avbryt
        </Button>
        <Button
          loading={
            addQuestionAndAnswerMutation.isPending ||
            updateQuestionAndAnswerMutation.isPending
          }
          onClick={form.handleSubmit}
        >
          {questionAndAnswer === undefined ? "Opprett" : "Lagre"}
        </Button>
      </Group>
    </Stack>
  );
}
