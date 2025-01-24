import { z } from "zod";
export const MatchableUserSchema = z.object({
    id: z.string(),
    items: z.set(z.string()),
    wantedItems: z.set(z.string()),
    groupMembership: z.string(),
});
export const MatchLocationSchema = z.object({
    name: z.string(),
    simultaneousMatchLimit: z.number().optional(),
});
