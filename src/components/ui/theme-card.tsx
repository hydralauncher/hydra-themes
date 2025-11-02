import type { Theme } from "@/lib/schemas/theme";
import { Button } from "./button";
import {
  CheckCircle2Icon,
  DownloadIcon,
  HeartIcon,
  XCircleIcon,
  X,
  Maximize2Icon,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/helpers";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogPortal, DialogOverlay } from "./dialog";

export interface ThemeCardProps {
  theme: Theme;
}

const AVATAR_SIZE = 25;

export function ThemeCard({ theme }: Readonly<ThemeCardProps>) {
  const [isFavorite, setIsFavorite] = useState(theme.isFavorite);
  const [favoriteCount, setFavoriteCount] = useState(theme.favoriteCount);
  const [downloadCount, setDownloadCount] = useState(theme.downloadCount);

  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const performThemeAction = useCallback(
    async (action: "install" | "favorite" | "unfavorite") => {
      setIsLoading(true);

      try {
        if (action === "unfavorite") {
          await api.put(`themes/${theme.id}/unfavorite`);
        } else {
          await api.put(`themes/${theme.id}/${action}`);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [theme],
  );

  const installTheme = useCallback(async () => {
    const searchParams = new URLSearchParams({
      theme: theme.name,
      authorId: theme.author.id,
      authorName: theme.author.displayName,
    });

    window.location.href = `hydralauncher://install-theme?${searchParams.toString()}`;

    await performThemeAction("install");
    setDownloadCount(downloadCount + 1);
  }, [theme]);

  const toggleFavorite = useCallback(async () => {
    const updatedIsFavorite = !isFavorite;
    setIsFavorite(updatedIsFavorite);

    if (isFavorite) {
      performThemeAction("unfavorite");
      setFavoriteCount(favoriteCount - 1);
      return;
    }

    performThemeAction("favorite");
    setFavoriteCount(favoriteCount + 1);
  }, [isFavorite, favoriteCount, performThemeAction, theme]);

  const profileImageUrl = useMemo(() => {
    if (!theme.author.profileImageUrl) return null;

    const bucketObject = theme.author.profileImageUrl.split("/");

    return `https://cdn.losbroxas.org/cdn-cgi/image/width=${AVATAR_SIZE},height=${AVATAR_SIZE},format=webp/${bucketObject.join("/")}`;
  }, [theme.author.profileImageUrl]);

  const thumbnailUrl = `/themes/${theme.name.toLowerCase()}/screenshot.webp`;
  const fullscreenUrl = `/themes/${theme.name.toLowerCase()}/screenshot-full.webp`;

  return (
    <>
      <div className="group w-full rounded-xl border p-2 transition-all">
        <div className="h-48 w-full rounded-lg bg-muted/20 relative">
          <img
            src={thumbnailUrl}
            alt={theme.name}
            className="size-full rounded-lg object-cover"
            loading="lazy"
          />
          <button
            className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-2.5 py-1.5 text-xs text-white shadow-lg transition-colors cursor-pointer"
            onClick={() => setIsPreviewOpen(true)}
            aria-label="View in fullscreen"
          >
            <Maximize2Icon className="size-3.5" />
            <span>View in fullscreen</span>
          </button>
        </div>

        <div className="mt-2 flex w-full flex-col gap-4 p-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="inline-flex flex-row items-center gap-1 text-xs font-medium uppercase text-muted-foreground">
              <span>{theme.name}</span>
            </h4>

            <div className="h-px flex-1 bg-muted/50"></div>

            <div className="flex items-center gap-2">
              <HeartIcon className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {compactNumber(favoriteCount)}
              </span>

              <DownloadIcon className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {compactNumber(downloadCount)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <img
                src={profileImageUrl ?? "/fallback-avatar.svg"}
                alt={theme.author.displayName}
                loading="lazy"
                className={cn(
                  {
                    "bg-muted/50 object-cover": profileImageUrl,
                  },
                  "size-6 rounded-full",
                )}
              />

              <a
                href={`hydralauncher://profile?userId=${theme.author.id}`}
                className="cursor-pointer text-xs text-muted-foreground hover:underline"
              >
                {theme.author.displayName}
              </a>
            </div>

            <div className="flex flex-row gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg"
                onClick={toggleFavorite}
                aria-label="Toggle theme as favorite"
                disabled={isLoading}
              >
                <HeartIcon
                  fill={isFavorite ? "currentColor" : "none"}
                  className="size-4 text-muted-foreground"
                />
              </Button>

              <Button
                variant="outline"
                size="default"
                className="rounded-lg"
                onClick={installTheme}
                disabled={isLoading}
              >
                Install
              </Button>
            </div>
          </div>

          <div className="flex flex-row items-center gap-2">
            {theme.hasAchievementsSupport ? (
              <>
                <CheckCircle2Icon className="size-4 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  Supports Achievements
                </span>
              </>
            ) : (
              <>
                <XCircleIcon className="size-4 text-red-500" />
                <span className="text-xs text-muted-foreground">
                  Does not support Achievements
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/40" />
          <button
            onClick={() => setIsPreviewOpen(false)}
            className="fixed right-4 top-4 z-[100] rounded-full bg-black/60 hover:bg-black/80 p-2 text-white transition-all backdrop-blur-sm cursor-pointer focus:outline-none pointer-events-auto"
            aria-label="Close preview"
          >
            <X className="size-5" />
          </button>
        </DialogPortal>
        <DialogContent className="max-w-[95vw] max-h-[95vh] !w-auto !h-auto p-0 !bg-transparent !border-none !shadow-none [&>button]:hidden !grid [&+*]:!hidden !translate-x-[-50%] !translate-y-[-50%] !z-[60] items-center justify-center">
          <style
            dangerouslySetInnerHTML={{
              __html: `
            [data-radix-dialog-content] ~ [data-radix-dialog-overlay],
            [data-radix-dialog-content] + [data-radix-dialog-overlay] {
              display: none !important;
            }
          `,
            }}
          />
          <img
            src={fullscreenUrl}
            alt={theme.name}
            className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain block"
            onError={(e) => {
              // Fallback to thumbnail if fullscreen version doesn't exist
              const target = e.target as HTMLImageElement;
              if (target.src !== thumbnailUrl) {
                target.src = thumbnailUrl;
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
