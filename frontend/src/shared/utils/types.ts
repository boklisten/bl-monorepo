export enum TextType {
  BLID,
  ISBN,
  UNKNOWN,
}

export type ScannedTextType = TextType.BLID | TextType.ISBN | TextType.UNKNOWN;
