import vine, { SimpleMessagesProvider } from "@vinejs/vine";

vine.messagesProvider = new SimpleMessagesProvider({
  "password.minLength": "Passord må minst ha {{ min }} tegn",
});
