import { z } from "zod";

import { UserPermissionEnum } from "#shared/permission/user-permission";

export const BlDocumentSchema = z.object({
  id: z.string(),
  lastUpdated: z.date().optional(),
  creationTime: z.date().optional(),
  active: z.boolean().optional(),
  user: z
    .object({
      id: z.string().describe("the id of the user"),
      permission: UserPermissionEnum.optional().describe(
        "the permission of the user",
      ),
    })
    .optional()
    .describe("the user that created the document"),
  viewableFor: z
    .string()
    .array()
    .optional()
    .describe(
      "ids of other user that can edit this document if it is restricted",
    ),
  viewableForPermission: UserPermissionEnum.optional().describe(
    "the lowest permission user needs to view this document",
  ),
  editableFor: z
    .string()
    .array()
    .optional()
    .describe(
      "ids of other users that can edit this document if it is restricted",
    ),
});

export type BlDocument = z.infer<typeof BlDocumentSchema>;
