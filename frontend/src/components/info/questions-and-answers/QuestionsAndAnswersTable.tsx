"use client";
// MRT does not support React Compiler yet
"use no memo";

import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
// @ts-expect-error MRT has bad types, hopefully they fix this in the future
import { MRT_Localization_NO } from "mantine-react-table/locales/no";

import QuestionAndAnswerEditor from "@/components/info/questions-and-answers/QuestionAndAnswerEditor";
import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import useApiClient from "@/hooks/useApiClient";
import { PLEASE_TRY_AGAIN_TEXT } from "@/utils/constants";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

export default function QuestionsAndAnswersTable() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  const destroyQuestionAndAnswerMutation = useMutation({
    mutationFn: (id: string) =>
      client.questions_and_answers({ id: id }).$delete().unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.questions_and_answers.$url()],
      }),
    onSuccess: () => showSuccessNotification("Spørsmål og svar ble slettet!"),
    onError: () =>
      showErrorNotification("Klarte ikke slette spørsmål og svar!"),
  });

  const {
    data: questionsAndAnswers,
    isLoading,
    error,
  } = useQuery({
    queryKey: [client.questions_and_answers.$url()],
    queryFn: () => client.questions_and_answers.$get().unwrap(),
  });

  const table = useMantineReactTable({
    columns: [
      {
        accessorKey: "question",
        header: "Spørsmål",
      },
      {
        accessorKey: "answer",
        header: "Svar",
      },
    ],
    data: questionsAndAnswers ?? [],
    enableEditing: true,
    state: {
      isLoading: isLoading || destroyQuestionAndAnswerMutation.isPending,
    },
    getRowId: (questionAndAnswer) => questionAndAnswer.id,
    renderRowActions: ({ row, table }) => (
      <>
        <Tooltip key={`edit-${row.id}`} label={"Endre"}>
          <ActionIcon
            variant={"subtle"}
            onClick={() => table.setEditingRow(row)}
          >
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Tooltip key={`delete-${row.id}`} label={"Slett"}>
          <ActionIcon
            variant={"subtle"}
            color={"red"}
            onClick={async () =>
              destroyQuestionAndAnswerMutation.mutate(row.id)
            }
          >
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </>
    ),
    renderTopToolbarCustomActions: () => (
      <Button onClick={() => table.setCreatingRow(true)}>Legg til</Button>
    ),
    mantineCreateRowModalProps: {
      size: "xl",
    },
    mantineEditRowModalProps: {
      size: "xl",
    },
    renderCreateRowModalContent: ({ table }) => (
      <QuestionAndAnswerEditor onClose={() => table.setCreatingRow(null)} />
    ),
    renderEditRowModalContent: ({ table, row }) => (
      <QuestionAndAnswerEditor
        questionAndAnswer={questionsAndAnswers?.find(
          (questionAndAnswer) => questionAndAnswer.id === row.id,
        )}
        onClose={() => table.setEditingRow(null)}
      />
    ),
    localization: MRT_Localization_NO,
  });

  if (error) {
    return (
      <ErrorAlert title={"Klarte ikke laste inn spørsmål og svar"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }

  return <MantineReactTable table={table} />;
}
