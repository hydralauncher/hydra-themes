import type { Theme } from "@/lib/schemas/theme";
import { Button } from "./button";
import { DownloadIcon, HeartIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface ThemeCardProps {
  theme: Theme;
}

export function ThemeCard({ theme }: Readonly<ThemeCardProps>) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(theme.favorites);
  const [downloadCount, setDownloadCount] = useState(theme.downloads);

  useEffect(() => {
    const isFavorite = window.localStorage.getItem(
      `theme_favorite:${theme.name}`,
    );

    setIsFavorite(isFavorite === "true");
  }, []);

  const performThemeAction = useCallback(
    (action: string) => {
      fetch("/api/theme", {
        method: "PUT",
        body: JSON.stringify({
          themeId: theme.id,
          action,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    [theme],
  );

  const installTheme = useCallback(() => {
    const searchParams = new URLSearchParams({
      theme: theme.name,
      authorId: theme.author.id,
      authorName: theme.author.displayName,
    });

    window.open(
      `hydralauncher://install-theme?${searchParams.toString()}`,
      "_blank",
    );

    performThemeAction("install");
    setDownloadCount(downloadCount + 1);
  }, [theme]);

  const toggleFavorite = useCallback(() => {
    const updatedIsFavorite = !isFavorite;
    setIsFavorite(updatedIsFavorite);

    window.localStorage.setItem(
      `theme_favorite:${theme.name}`,
      updatedIsFavorite.toString(),
    );

    if (isFavorite) {
      performThemeAction("remove-favorite");
      setFavoriteCount(favoriteCount - 1);
      return;
    }

    performThemeAction("favorite");
    setFavoriteCount(favoriteCount + 1);
  }, [isFavorite, favoriteCount, theme]);

  return (
    <div className="group w-full rounded-xl border p-2 transition-all">
      <div className="h-48 w-full rounded-lg bg-muted/20">
        <img
          src={`/themes/${theme.name.toLowerCase()}/${theme.screenshotFile}`}
          alt={theme.name}
          className="size-full rounded-lg object-cover"
        />
      </div>

      <div className="mt-2 flex w-full flex-col gap-4 p-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="inline-flex flex-row items-center gap-1 text-xs font-medium uppercase text-muted-foreground">
            <span>{theme.name}</span>
          </h4>

          <div className="h-px flex-1 bg-muted/50"></div>

          <div className="flex items-center gap-2">
            <DownloadIcon className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {downloadCount}
            </span>

            <HeartIcon className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {favoriteCount}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src={`/themes/${theme.name.toLowerCase()}/${theme.authorImage}`}
              alt={theme.author.displayName}
              className="size-6 rounded-full"
            />
            <a
              href={`hydralauncher://profile?userId=${theme.author.id}`}
              className="cursor-pointer text-xs text-muted-foreground hover:underline"
            >
              {theme.author.displayName}
            </a>
          </div>

          <div className="flex flex-row gap-2">
            <Button variant="outline" size="icon" onClick={toggleFavorite}>
              <HeartIcon
                fill={isFavorite ? "currentColor" : "none"}
                className="size-4 text-muted-foreground"
              />
            </Button>

            <Button variant="outline" size="default" onClick={installTheme}>
              Install
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
