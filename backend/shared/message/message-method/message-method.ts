export enum MessageMethod {
  SMS = "sms",
  EMAIL = "email",
}

export function messageMethodToString(messageMethod: MessageMethod) {
  if (messageMethod === MessageMethod.EMAIL) {
    return "e-post";
  }
  return "sms";
}
