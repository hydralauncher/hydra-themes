import { redis } from "@/lib/redis";
import type { APIRoute } from "astro";
import { orderBy, slice } from "lodash-es";

import themeList from "@/lib/themes.json";
import type { Theme } from "@/lib/schemas/theme";
export interface ThemeActionBody {
  themeId: string;
  action: "install" | "favorite" | "remove-favorite";
}

export const PAGE_SIZE = 12;

export interface ThemeListResponse {
  edges: Theme[];
  count: number;
}

export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "downloads";

  const themes = await Promise.all(
    themeList.map(async (theme) => {
      const themeData = await redis.get(`theme:${theme.id}`).then((data) => {
        if (!data) return { downloads: 0, favorites: 0 };
        return JSON.parse(data);
      });

      return { ...theme, ...themeData };
    }),
  );

  const sortedThemes = orderBy(themes, sort, "desc");

  const response = {
    edges: slice(sortedThemes, (page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    count: sortedThemes.length,
  } as ThemeListResponse;

  return new Response(JSON.stringify(response), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

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
