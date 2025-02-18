import { useStore } from "@nanostores/react";
import { searchQuery } from "@/stores/search";
import { ThemeCard } from "./theme-card";
import { Frown } from "lucide-react";
import { Button } from "./button";
import type { Theme } from "@/lib/schemas/theme";

interface ThemeListProps {
  themes: Theme[];
}

export function ThemeList({ themes }: Readonly<ThemeListProps>) {
  const query = useStore(searchQuery);

  const filteredThemes = themes.filter((theme) => {
    if (!query.length) return true;

    if (query.length < 3) {
      return theme.name.toLowerCase().startsWith(query.toLowerCase());
    }

    return theme.name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="relative mt-10 grid h-full grid-cols-1 gap-6 pt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {filteredThemes.length ? (
        filteredThemes.map((theme) => (
          <ThemeCard key={theme.name} theme={theme} />
        ))
      ) : (
        <div className="col-span-4 mt-32 flex flex-col items-center justify-center gap-6 text-center">
          <Frown className="size-10 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">
            No themes found... <br /> consider contributing with what you think
            is missing!
          </p>
          <Button variant="secondary" size="sm" className="w-fit">
            Submit a theme
          </Button>
        </div>
      )}
    </div>
  );
}
