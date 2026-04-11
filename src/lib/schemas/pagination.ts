import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().min(0),
  perPage: z.number().min(1),
  total: z.number().min(0),
});

export type PaginationSchema = z.infer<typeof paginationSchema>;
