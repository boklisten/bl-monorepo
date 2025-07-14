"use client";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Container,
  Skeleton,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { TextEditor } from "@/components/TextEditor";
import useApiClient from "@/utils/api/useApiClient";

export default function QuestionsAndAnswersReadOnly() {
  const client = useApiClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: [client.questions_and_answers.$url()],
    queryFn: () => client.questions_and_answers.$get().unwrap(),
  });
  if (isLoading) {
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
  if (isError || !data) {
    return (
      <Container>
        <Alert severity="error">
          <AlertTitle>Klarte ikke laste inn spørsmål og svar</AlertTitle>
          Du kan prøve å laste inn siden på nytt, eller ta kontakt dersom
          problemet vedvarer.
        </Alert>
      </Container>
    );
  }
  return (
    <>
      {data.length === 0 && (
        <Alert severity="info">Ingen spørsmål og svar er publisert enda</Alert>
      )}
      {data.map((questionAndAnswer) => (
        <Accordion key={questionAndAnswer.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <TextEditor readOnly content={questionAndAnswer.question} />
          </AccordionSummary>
          <AccordionDetails>
            <TextEditor readOnly content={questionAndAnswer.answer} />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
