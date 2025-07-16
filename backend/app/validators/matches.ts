import vine from "@vinejs/vine";

export const matchGenerateSchema = vine.object({
  branches: vine.array(vine.string()),
  standLocation: vine.string(),
  userMatchLocations: vine.array(
    vine.object({
      name: vine.string(),
      simultaneousMatchLimit: vine.number().optional(),
    }),
  ),
  startTime: vine.date(),
  deadlineBefore: vine.date(),
  matchMeetingDurationInMS: vine.number(),
  includeCustomerItemsFromOtherBranches: vine.boolean(),
});
export const matchGenerateValidator = vine.compile(matchGenerateSchema);

export const matchNotifySchema = vine.object({
  target: vine.enum(["user-matches", "stand-only", "all"]),
  message: vine.string().minLength(10),
});
export const matchNotifyValidator = vine.compile(matchNotifySchema);

export const matchLockSchema = vine.object({
  customerId: vine.string(),
  userMatchesLocked: vine.boolean(),
});

export const matchLockValidator = vine.compile(matchLockSchema);

export const matchTransferSchema = vine.object({
  blid: vine.string(),
});
export const matchTransferValidator = vine.compile(matchTransferSchema);
