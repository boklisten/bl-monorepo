import sanitizeHtml from "sanitize-html";

const quillRegex = /^ql-.*$/;
const quillClasses = ["span", "blockquote", "p", "em"];

export const sanitizeQuillHtml = (text: string): string => {
  return sanitizeHtml(text, {
    allowedClasses: Object.fromEntries(
      quillClasses.map((tag) => [tag, [quillRegex]]),
    ),
  });
};
