import { z } from "zod";

/**
 * §16.4 — reorder payload: the full ordered array of document ids. The server
 * reindexes `order` = index + 1 for each.
 */
export const reorderIdsSchema = z.object({
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid id")).min(1),
});

export type ReorderIdsInput = z.infer<typeof reorderIdsSchema>;
