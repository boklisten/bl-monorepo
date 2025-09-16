"use client";
import { QuestionAndAnswer } from "@boklisten/backend/shared/question-and-answer";
import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  Skeleton,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import InfoAlert from "@/shared/components/alerts/InfoAlert";
import RichTextEditorReadOnly from "@/shared/components/RichTextEditorReadOnly";
import useApiClient from "@/shared/hooks/useApiClient";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";

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
      <ErrorAlert title={"Klarte ikke laste inn spørsmål og svar"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }

  return (
    <>
      {data.length === 0 && (
        <InfoAlert>Ingen spørsmål og svar er publisert enda</InfoAlert>
      )}
      <Accordion>
        {data.map((questionAndAnswer) => (
          <AccordionItem
            key={questionAndAnswer.id}
            value={questionAndAnswer.id}
          >
            <AccordionControl>
              <RichTextEditorReadOnly content={questionAndAnswer.question} />
            </AccordionControl>
            <AccordionPanel>
              <RichTextEditorReadOnly content={questionAndAnswer.answer} />
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
