export interface TextBlock {
  text: string; // the text in the text block
  title?: string; // the title of the message (optional)
  warning?: boolean; // if textBlock is a warning
  alert?: boolean; // if textBlock is an alert
  secondary?: boolean; // if textBlock is secondary
}
