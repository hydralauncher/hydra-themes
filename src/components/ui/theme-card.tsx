import type { Theme } from "@/lib/schemas/theme";
import { Button } from "./button";

export interface ThemeCardProps {
  theme: Theme;
}

export function ThemeCard({ theme }: Readonly<ThemeCardProps>) {
  const handleClick = () => {
    window.open(
      `hydralauncher://install-theme?theme=${theme.name}&authorId=${theme.author.id}&authorName=${theme.author.displayName}`,
      "_blank",
    );
  };

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

          <Button
            variant="outline"
            size="default"
            onClick={handleClick}
          >
            Install theme
          </Button>
        </div>
      </div>
    </div>
  );
}
