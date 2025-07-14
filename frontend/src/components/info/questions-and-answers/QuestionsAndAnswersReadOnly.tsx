"use client";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Container,
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
    return;
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
