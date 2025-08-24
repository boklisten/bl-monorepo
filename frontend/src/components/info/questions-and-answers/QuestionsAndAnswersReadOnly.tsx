"use client";
import { QuestionAndAnswer } from "@boklisten/backend/shared/question-and-answer";
import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  Alert,
  Skeleton,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import { TextEditor } from "@/components/TextEditor";
import useApiClient from "@/utils/api/useApiClient";

export default function QuestionsAndAnswersReadOnly({
  cachedData,
}: {
  cachedData?: QuestionAndAnswer[];
}) {
  const client = useApiClient();

  const {
    data: freshData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [client.questions_and_answers.$url()],
    queryFn: () => client.questions_and_answers.$get().unwrap(),
  });

  const data = freshData ?? cachedData;

  if (isLoading && data === undefined) {
    return (
      <>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(
          (id) => (
            <Skeleton height={45} key={`Skeleton-${id}`} />
          ),
        )}
      </>
    );
  }
  if (isError || data === undefined) {
    return (
      <Alert color={"red"} title={"Klarte ikke laste inn spørsmål og svar"}>
        Du kan prøve å laste inn siden på nytt, eller ta kontakt dersom
        problemet vedvarer.
      </Alert>
    );
  }

  return (
    <>
      {data.length === 0 && (
        <Alert color={"blue"}>Ingen spørsmål og svar er publisert enda</Alert>
      )}
      <Accordion>
        {data.map((questionAndAnswer) => (
          <AccordionItem
            key={questionAndAnswer.id}
            value={questionAndAnswer.id}
          >
            <AccordionControl>
              <TextEditor readOnly content={questionAndAnswer.question} />
            </AccordionControl>
            <AccordionPanel>
              <TextEditor readOnly content={questionAndAnswer.answer} />
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
