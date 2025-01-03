import { z } from "zod";

export const MatchMeetingInfoSchema = z.object({
  meetingInfo: z.object({
    location: z.string().nonempty(),
    date: z.date().optional(),
  }),
});
