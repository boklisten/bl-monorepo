"use client";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Input,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { isAdmin } from "@/api/auth";

interface QNA {
  id: string;
  question: string;
  answer: string;
}

const QuestionWithAnswer = ({
  id,
  question,
  answer,
  expanded,
  handleExpand,
  updateQuestion,
  deleteQuestion,
}: QNA & {
  expanded: boolean;

  handleExpand: (questionId: string) => void;

  updateQuestion: (QNA: QNA) => void;

  deleteQuestion: (questionId: string) => void;
}) => {
  const [edit, setEdit] = useState(false);
  const questionInput = useRef(undefined);
  const answerInput = useRef(undefined);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <Accordion
      expanded={expanded}
      sx={{ width: "100%" }}
      onChange={() => handleExpand(id)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="question-content"
        sx={{ display: "flex" }}
      >
        {edit && (
          <Input
            inputRef={questionInput}
            sx={{ flexGrow: 1 }}
            defaultValue={question}
          />
        )}
        {!edit && <Typography sx={{ flexGrow: 1 }}>{question}</Typography>}
        {hydrated && isAdmin() && (
          <>
            <Tooltip title={edit ? "Lagre" : "Rediger"}>
              <IconButton
                onClick={() => {
                  if (edit) {
                    updateQuestion({
                      id: id,

                      // @ts-expect-error fixme: auto ignored
                      question: questionInput.current.value,

                      // @ts-expect-error fixme: auto ignored
                      answer: answerInput.current.value,
                    });
                  }
                  setEdit(!edit);
                }}
              >
                {edit ? <SaveIcon /> : <EditIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Slett">
              <IconButton onClick={() => deleteQuestion(id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </AccordionSummary>
      <AccordionDetails>
        {edit && (
          <Input
            inputRef={answerInput}
            sx={{ width: "100%" }}
            defaultValue={answer}
          />
        )}
        {!edit && <Typography>{answer}</Typography>}
      </AccordionDetails>
    </Accordion>
  );
};
const EditableQNA = ({ QNAs }: { QNAs: QNA[] }) => {
  const [expandedQuestionId, setExpandedQuestionId] = useState("");
  const handleExpand = (questionId: string) => {
    if (questionId === expandedQuestionId) {
      setExpandedQuestionId("");
      return;
    }
    setExpandedQuestionId(questionId);
  };

  const updateQuestion = (QNA: QNA) => {
    const questionIndex = QNAs.findIndex((q) => q.id === QNA.id);
    QNAs[questionIndex] = QNA;
  };

  const deleteQuestion = (questionId: string) => {
    QNAs = QNAs.filter((QNA) => QNA.id !== questionId);
  };

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography variant="h4" sx={{ textAlign: "center", marginBottom: 2 }}>
        Spørsmål og svar
      </Typography>
      {QNAs.map((QNA) => (
        <QuestionWithAnswer
          deleteQuestion={deleteQuestion}
          updateQuestion={updateQuestion}
          handleExpand={handleExpand}
          expanded={expandedQuestionId === QNA.id}
          key={QNA.id}
          {...QNA}
        />
      ))}

      {hydrated && isAdmin() && (
        <Tooltip title="Legg til spørsmål">
          <IconButton
            onClick={() =>
              QNAs.push({
                id: "foo",
                question: "nytt spørsmål",
                answer: "nytt svar",
              })
            }
          >
            <AddCircleIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default EditableQNA;
