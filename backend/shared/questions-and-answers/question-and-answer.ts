import { BlDocument } from "#shared/bl-document/bl-document";

export interface QuestionAndAnswer extends BlDocument {
  question: string;
  answer: string;
}
