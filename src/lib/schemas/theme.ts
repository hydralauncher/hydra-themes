import { z } from "zod";

export const themeSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(56),
  screenshotFileName: z.string().min(3).max(256),
  cssFileName: z.string().min(3).max(256),
  author: z.object({
    id: z.string(),
    displayName: z.string(),
    profileImageUrl: z.string().nullable(),
  }),
  downloadCount: z.number().min(0),
  favoriteCount: z.number().min(0),
  features: z.array(z.enum(["achievement-notification"])),
  isFavorite: z.boolean(),
  isInstalled: z.boolean(),
});

export type Theme = z.infer<typeof themeSchema>;
