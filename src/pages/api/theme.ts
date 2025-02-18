import { redis } from "@/lib/redis";
import type { APIRoute } from "astro";

export interface ThemeActionBody {
  themeId: string;
  action: "install" | "favorite" | "remove-favorite";
}

export const PUT: APIRoute = async ({ request }) => {
  const body = await request.json();

  const { themeId, action } = body;

  const currentStats = await redis.get(`theme:${themeId}`).then((data) => {
    if (!data) return { downloads: 0, favorites: 0 };
    return JSON.parse(data);
  });

  if (action === "install") {
    currentStats.downloads += 1;
  } else if (action === "favorite") {
    currentStats.favorites += 1;
  } else if (action === "remove-favorite") {
    currentStats.favorites -= 1;
  }

  await redis.set(`theme:${themeId}`, JSON.stringify(currentStats));

  return new Response(JSON.stringify(currentStats), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
