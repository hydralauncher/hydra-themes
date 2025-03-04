import { z } from "zod";

const PaginationSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  total: z.number(),
});

export type PaginationSchema = z.infer<typeof PaginationSchema>;
