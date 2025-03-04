import { z } from "zod";

export const themeSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(56),
  screenshotFile: z.string().min(3).max(256),
  cssFile: z.string().min(3).max(256),
  author: z.object({
    id: z.string(),
    displayName: z.string(),
    profileImageUrl: z.string().nullable(),
  }),
  downloads: z.number().min(0),
  favorites: z.number().min(0),
});

export type Theme = z.infer<typeof themeSchema>;
