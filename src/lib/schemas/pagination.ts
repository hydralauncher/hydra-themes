import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  total: z.number(),
});

export type PaginationSchema = z.infer<typeof paginationSchema>;
